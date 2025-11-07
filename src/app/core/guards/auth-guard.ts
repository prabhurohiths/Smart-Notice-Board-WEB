import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getLoggedUser();

    // Step 1: Check if user is logged in
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Step 2: Check if route has restricted roles
    const allowedRoles = route.data['roles'] as Array<string>;

    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles = user.roles.map((r: any) => r.name);
      const isAuthorized = userRoles.some(role => allowedRoles.includes(role));

      if (!isAuthorized) {
        alert('You are not authorized to access this page.');
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true; // allow access
  }
}
