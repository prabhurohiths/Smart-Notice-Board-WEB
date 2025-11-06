import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  token(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<any>(
      `${this.authService.basePath}user/token`,
      null, // No body since we're sending params
      { params }
    ).pipe(
      tap(data => {
        this.authService.saveToken(data.accessToken, data.refreshToken);
      })
    );
  }


  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(this.authService.basePath + "user/login", { username, password })
      .pipe(tap(user => {
        this.authService.setLoggedUser(user);
        // this.currentUserSubject.next(user);
      }));
  }

  getCurrentUser(): User | null {
    return JSON.parse(sessionStorage.getItem('user') || 'null');
  }

  validateToken() {
    return this.http.get(this.authService.basePath + "sample/validatetoken");
  }
}
