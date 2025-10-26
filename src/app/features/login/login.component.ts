import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private user: UserService, private router: Router,private authService: AuthService) { }

  login() {
    this.user.token(this.username, this.password).subscribe({
      next: data => {
        this.user.login(this.username, this.password).subscribe({
          next: user => {
            this.router.navigate(['/dashboard']);
          },
          error: err => this.error = err.error?.message || 'Login failed'
        });
      },
      error: err => this.error = err.error?.message || 'Login failed'
    });


    // this.user.login(this.username, this.password).subscribe({
    //   next: user => {
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: err => this.error = err.error?.message || 'Login failed'
    // });
  }
}
