import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from '../models/member';
import { MemberService } from '../services/member.service';
import { PresenceService } from '../services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;

  constructor(private memberService: MemberService,  private toastr: ToastrService,
      public presence: PresenceService) { }

  ngOnInit(): void {
  }

  addLike(member: Member) {
    this.memberService.addLikes(member.userName).subscribe(response => {
      this.toastr.success('You have liked ' + member.knownAs);
    }, error => {
      console.log(error);
      this.toastr.error(error.error);
    })
  }

}
