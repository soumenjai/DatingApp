import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { Member } from '../models/member';
import { Pagination } from '../models/pagination';
import { User } from '../models/User';
import { UserParams } from '../models/userParams';
import { AccountService } from '../services/account.service';
import { MemberService } from '../services/member.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[];
  pagination: Pagination;
  userParams: UserParams;
  user: User;

  constructor(private memberService: MemberService,
      private accountService: AccountService) { 
        this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
          this.user = user;
          this.userParams = new UserParams(user);
        })
      }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.userParams).subscribe(response => {
      this.members = response.result;
      this.pagination = response.pagination;
      console.log('Pagination: ', this.pagination);
      console.log('Pagination: ', this.members);
    }, error => {
      console.log(error);
    })
  }

  pageChanged(event: any) {
    this.userParams.pageNumber = event.page;
    this.loadMembers();
  }

}
