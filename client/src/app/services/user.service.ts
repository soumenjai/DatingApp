import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url: string =  "https://localhost:44390/api/users";
  private header = new HttpHeaders().set('Content-Type', 'application/json').set('Access-Control-Allow-Origin', '*');
  
  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get(this.url, { headers: this.header });
  }
}
