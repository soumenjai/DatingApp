import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  baseUrl = environment.apiUrl;
  private header = new HttpHeaders({
    Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token
  }).set('Content-Type', 'application/json').set('Access-Control-Allow-Origin', '*');

  constructor(private http: HttpClient) { }

  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'users', {headers: this.header})
  }

  getMember(username: string) {
    return this.http.get<Member>(this.baseUrl + 'users/' + username, {headers: this.header})
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member, {headers: this.header})
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + "users/setmainphoto/" + photoId, {}, {headers: this.header})
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + "users/deletephoto/" + photoId, {headers: this.header})
  }
}
