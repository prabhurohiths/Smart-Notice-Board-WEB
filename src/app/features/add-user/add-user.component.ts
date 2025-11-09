import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-add-user',
  standalone: false,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  user: User = {
    username: '',
    name: '',
    mobileNumber: '',
    dateOfBirth: '',
    gmail: '',
    department: '',
    year: 0,
    roles: [{ id: 3, name: 'STUDENT' }]  // Default role
  };

  success = '';
  error = '';

  constructor(private userService: UserService, private router: Router) {}

  addUser() {
    this.userService.registerUser(this.user).subscribe({
      next: () => {
        this.success = 'User added successfully!';
        setTimeout(() => this.router.navigate(['/manage-users']), 1500);
      },
      error: err => {
        this.error = err.error?.message || 'Error adding user';
      }
    });
  }
}
