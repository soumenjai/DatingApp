import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private url: string =  environment.apiUrl;
  private header = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('Access-Control-Allow-Credentials', 'true');

  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private presence: PresenceService) { }

  login(model: any) {
    console.log(model);
    return this.http.post(this.url + 'account/login', model, {headers: this.header})
      .pipe(
        map((response: User) => {
          const user = response;
          if(user) {
            this.setCurrentUser(user);
            this.presence.createHubConnection(user);
          }
        })
      );
  }

  register(model: any) {
    return this.http.post(this.url + "account/register", model, {headers: this.header})
    .pipe(
      map((response: User) => {
        const user = response;
          if(user) {
            this.setCurrentUser(user);
            this.presence.createHubConnection(user);
          }
      })
    );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }
}
