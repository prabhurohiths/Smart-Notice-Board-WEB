import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
   standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private user: UserService, private router: Router, private authService: AuthService) { }

  login() {
    // Step 1: Request token
    this.user.token(this.username, this.password).subscribe({
      next: () => {
        // Step 2: Fetch user details
        this.user.login(this.username, this.password).subscribe({
          next: (user) => {
            this.redirectBasedOnRole(user);
          },
          error: err => this.error = err.error?.message || 'Login failed'
        });
      },
      error: err => this.error = err.error?.message || 'Login failed'
    });
  }


  private redirectBasedOnRole(user: any) {
  if (!user.roles || user.roles.length === 0) {
    this.router.navigate(['/login']);
    return;
  }

  const roleNames = user.roles.map((r: any) => r.name);
  sessionStorage.setItem("loggedUserRole", roleNames[0]);

  this.router.navigate(['/dashboard']); // ✅ single entry point now
}

}
