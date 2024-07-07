import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from './global';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 /* getToken(): string | null {
    throw new Error('Method not implemented.');
  }
  getIdentity(): User {
    throw new Error('Method not implemented.');
  }*/
  public url: string;
  public user: string | undefined;

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getIdentity(): User | null {
    const identityString = localStorage.getItem('user');
    return identityString ? JSON.parse(identityString) : null;
  }

  getUserProfile(): Observable<any> {
    const user = this.getIdentity();
    if (!user) {
      throw new Error('No se puede obtener el perfil del usuario, usuario no identificado.');
    }
    const userId = user.id;
    const headers = new HttpHeaders().set('Authorization', this.getToken() || '');

    return this._http.get<any>(`${this.url}user/${userId}`, { headers });
  }

  updateUserProfile(user: User): Observable<any> {
    this.getIdentity();
    if (!user) {
      throw new Error('No se puede actualizar el perfil del usuario, usuario no identificado.');
    }
    const userId = user.id;
    const params = JSON.stringify(user);
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.getToken() || '');

    return this._http.put<any>(`${this.url}user/${userId}`, params, { headers });
  }

  /*getUserProfile(): Observable<any> {
    const userId = this.getIdentity()?.id;
    if (!userId) {
      throw new Error('No se puede obtener el perfil del usuario, usuario no identificado.');
    }
    const headers = new HttpHeaders().set('Authorization', this.getToken() || '');

    return this._http.get<any>(`${this.url}user/${userId}`, { headers });
  }

  updateUserProfile(user: User): Observable<any> {
    const userId = this.getIdentity()?.id;
    if (!userId) {
      throw new Error('No se puede actualizar el perfil del usuario, usuario no identificado.');
    }
    const params = JSON.stringify(user);
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.getToken() || '');

    return this._http.put<any>(`${this.url}user/${userId}`, params, { headers });
  }*/

  register(user: User): Observable<any> {
    let params = JSON.stringify(user);  // Serialize the user object
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url + 'register', params, { headers: headers });
  }

  login(user: User): Observable<any> {
    let params = JSON.stringify(user);  // Serialize the user object
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url + 'login', params, { headers: headers });
  }

  getCounters(userId: string): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'counters/' + userId, { headers: headers });
  }

 /* getUserProfile(userId: string): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'user/' + userId, { headers: headers });
  }*/

    getUsers(page: number | null = null): Observable<any> {
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this.getToken() || '');

      return this._http.get<any>(`${this.url}users/${page}`, { headers: headers });
    }

    getUser(userId: string): Observable<any> {
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this.getToken() || '');

      return this._http.get<any>(`${this.url}user/${userId}`, { headers: headers });
    }
  }
