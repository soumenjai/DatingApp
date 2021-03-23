import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Member } from '../models/member';
import { User } from '../models/User';
import { AccountService } from '../services/account.service';
import { MemberService } from '../services/member.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;
  member: Member;
  user: User;
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if(this.editForm.dirty) {
      $event.returnValue = true;
    }
  }
  constructor(private accountService: AccountService, 
              private memberService: MemberService,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
    this.loadMember();
  }

  loadMember() {
    this.memberService.getMember(this.user.username).subscribe(response => {
      this.member = response;
      console.log(response);
    }, error => {
      console.log(error);
    })
  }

  updateMember() {
    this.memberService.updateMember(this.member).subscribe(() => {
      this.toastr.success("Profile update successfully");
      this.editForm.reset(this.member);
    })
  }

}
