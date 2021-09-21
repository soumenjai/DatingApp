import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { PaginatedResult } from '../models/pagination';
import { UserParams } from '../models/userParams';
import { getPaginatedResults, getPaginationHeader } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  baseUrl = environment.apiUrl;

  private header = new HttpHeaders({
    Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token
  }).set('Content-Type', 'application/json').set('Access-Control-Allow-Origin', '*');

  constructor(private http: HttpClient) { }

  getMembers(userParams: UserParams) {
    let params = getPaginationHeader(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);

    return getPaginatedResults<Member[]>(this.baseUrl + 'users', params, this.http);
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

  addLikes(username: string) {
    return this.http.post(this.baseUrl + "likes/" + username, {}, {headers: this.header})
  }

  getLikes(predicate: string, pageNumber, pageSize) {
    let params = getPaginationHeader(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    return getPaginatedResults<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http);
  }
}
