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
    const token = sessionStorage.getItem('authToken');
    return !!token;
  }

  logout(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.clear(); // Clears all items in sessionStorage
    this.router.navigate(['/login']);
  }

  saveToken(authToken: string, refreshToken: string): void {
    console.log("authToken", authToken)
    console.log("refreshToken", refreshToken)
    sessionStorage.setItem('authToken', authToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  setLoggedUser(user: User) {
    // sessionStorage.setItem('loggedUser',user);
    sessionStorage.setItem('loggedUser', JSON.stringify(user));
  }

  getLoggedUser(): User | null {
    return JSON.parse(sessionStorage.getItem('loggedUser') || 'null');
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.getLoggedUser();
    if (!user || !user.roles) return false;
    const userRoles = user.roles.map((r: any) => r.name);
    return requiredRoles.some(role => userRoles.includes(role));
  }

}
