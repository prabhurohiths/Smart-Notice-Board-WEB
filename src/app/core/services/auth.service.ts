import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  public basePath = "http://localhost:8080/";

  isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  saveToken(authToken: string, refreshToken: string): void {
    console.log("authToken", authToken)
    console.log("refreshToken", refreshToken)
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  setLoggedUser(user:User){
    // localStorage.setItem('loggedUser',user);
    localStorage.setItem('loggedUser', JSON.stringify(user));
  }

  getLoggedUser(): User | null {
    return JSON.parse(localStorage.getItem('loggedUser') || 'null');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  

  hasRole(roleName: string): boolean {
    const user = this.getLoggedUser();
    return user?.roles.some(r => r.name === roleName) || false;
  }

}
