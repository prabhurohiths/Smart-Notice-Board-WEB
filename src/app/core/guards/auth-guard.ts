import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getLoggedUser();

    // Step 1: Ensure user is logged in
    if (!user || !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Step 2: Block access to everything except reset-password for first-time users
    if (user.firstLogin && state.url !== '/reset-password') {
      this.router.navigate(['/reset-password']);
      return false;
    }

    // Step 3: Check if route requires certain roles
    const allowedRoles = route.data['roles'] as Array<string>;

    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles = user.roles.map((r: any) => r.name);
      const isAuthorized = userRoles.some(role => allowedRoles.includes(role));

      if (!isAuthorized) {
        alert('⚠️ You are not authorized to access this page.');
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true; // Allow route access
  }
}
