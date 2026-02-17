import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private authService: AuthService) { }
  private key = CryptoJS.enc.Utf8.parse('SNB@SecureKey2025!StrongAESKey!!'); // 32 bytes for AES-256
  private iv = CryptoJS.enc.Utf8.parse('RandomInitVector'); // 16 bytes

  encryptPassword(password: string): string {
    const encrypted = CryptoJS.AES.encrypt(password, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); // Base64 string
  }

  token(username: string, password: string): Observable<any> {
    const encrypted = this.encryptPassword(password);
    console.log("eencrpted password,, ", encrypted)
    const params = new HttpParams()
      .set('username', username)
      .set('password', encrypted);

    return this.http.post<any>(
      `${this.authService.basePath}user/token`,
      null,
      { params }
    ).pipe(
      tap(data => {
        this.authService.saveToken(data.accessToken, data.refreshToken);
      })
    );
  }

  login(username: string, password: string): Observable<User> {
    const encrypted = this.encryptPassword(password);
    return this.http.post<User>(this.authService.basePath + "user/login", { username, password: encrypted })
      .pipe(tap(user => {
        this.authService.setLoggedUser(user);
      }));
  }

  resetPassword(username: string, newPassword: string) {
    const encrypted = this.encryptPassword(newPassword);
    return this.http.post(
      `${this.authService.basePath}user/resetPassword`,
      null,
      {
        params: { username, newPassword: encrypted },
        responseType: 'text'
      }
    );
  }

  updateUserStatus(id: number, active: boolean): Observable<any> {
    return this.http.put(
      `${this.authService.basePath}user/updateStatus/${id}`,
      { active }
    );
  }

  getCurrentUser(): User | null {
    return JSON.parse(sessionStorage.getItem('user') || 'null');
  }

  validateToken() {
    return this.http.get(this.authService.basePath + "sample/validatetoken");
  }

  registerUser(user: User) {
    return this.http.post(this.authService.basePath + 'user/register', user);
  }

  getAllUsers(page: number = 0, size: number = 6): Observable<any> {
    return this.http.get<any>(`${this.authService.basePath}user/getAllUsers?page=${page}&size=${size}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.authService.basePath}user/delete/${id}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.authService.basePath}user/getUserById/${id}`);
  }

  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.authService.basePath}user/updateUser/${user.id}`, user);
  }

  checkUsernameExists(username: string) {
    return this.http.get<{ exists: boolean }>(this.authService.basePath + 'user/checkUsername?username=' + encodeURIComponent(username));
  }
}
