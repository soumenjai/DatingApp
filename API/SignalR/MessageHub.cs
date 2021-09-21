using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extension;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IMapper _mapper;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly PresenceTracker _presenceTracker;
        public MessageHub(IMessageRepository messageRepository, 
            IMapper mapper, 
            IUserRepository userRepository,
            IHubContext<PresenceHub> presenceHub,
            PresenceTracker presenceTracker)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _messageRepository = messageRepository;
            _presenceHub = presenceHub;
            _presenceTracker = presenceTracker;
        }
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.GetUserName(), otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await AddToGroup(groupName);

            var messages = await _messageRepository.GetMessageThread(Context.User.GetUserName(), otherUser);
            await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await RemoveFromMessageGroup(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var username = Context.User.GetUserName();

            if (username == createMessageDto.RecipientName.ToLower())
                throw new HubException("you can not message ypurself");
            var sender = await _userRepository.GetUserByUserNameAsync(username);
            var receipent = await _userRepository.GetUserByUserNameAsync(createMessageDto.RecipientName);

            if (receipent == null) 
                throw new HubException("Not found user");

            var message = new Message
            {
                Sender = sender,
                Recipient = receipent,
                SenderName = sender.UserName,
                RecipientName = receipent.UserName,
                Content = createMessageDto.Content
            };
            var groupName = GetGroupName(sender.UserName, receipent.UserName);
            var group = await _messageRepository.GetMessageGroup(groupName);
            if(group.Connections.Any(x => x.Username == receipent.UserName)) {
                message.DateRead = DateTime.UtcNow;
            }
            else {
                var connections = _presenceTracker.GetConnectionForUser(receipent.UserName);
                IReadOnlyList<string> connectionsReadOnly = connections.AsReadOnly();
                if(connections != null) {
                    await _presenceHub.Clients.Clients(connectionsReadOnly).SendAsync("NewMessageReceived",
                        new {username = sender.UserName, knownAs = sender.KnownAs});
                }

            }
            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync()) {
                await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
            }
            throw new HubException("Failed to send message");
        }
        private async Task<bool> AddToGroup(string groupName)
        {
            var group = await _messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());

            if(group == null) {
                group = new Group(groupName);
                _messageRepository.AddGroup(group);
            }
            return await _messageRepository.SaveAllAsync();
        }
        private async Task RemoveFromMessageGroup(string connectionId)
        {
            var connection = await _messageRepository.GetConnection(connectionId);
            _messageRepository.RemoveConnection(connection);
            await _messageRepository.SaveAllAsync();
        }
        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
    }
}