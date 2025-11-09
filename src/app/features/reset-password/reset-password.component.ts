import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  success = '';
  error = '';
  isLoading = false;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  resetPassword() {
    this.success = '';
    this.error = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Please enter and confirm your new password.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    const user = this.auth.getLoggedUser();
    if (!user) {
      this.error = 'User not found. Please log in again.';
      return;
    }

    this.isLoading = true;

    this.userService.resetPassword(user.username, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = '✅ Password updated successfully!';
        setTimeout(() => {
          this.auth.logout();
        },400);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || '❌ Password update failed. Please try again.';
      }
    });
  }
}
