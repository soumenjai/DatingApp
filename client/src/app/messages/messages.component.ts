import { Component, OnInit } from '@angular/core';
import { Message } from '../models/message';
import { Pagination } from '../models/pagination';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  pagination: Pagination;
  container = 'Inbox';
  pageNumer = 1;
  pageSize = 10;

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.pageNumer, this.pageSize, this.container)
      .subscribe(response => {
        console.log(response.result);
        this.messages = response.result;
        this.pagination = response.pagination;
      })
  }

  pageChanged(event: any) {
    this.pageNumer = event.page;
    this.loadMessages();
  }

}
