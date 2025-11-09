import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-edit-user',
  standalone: false,
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user: User = {
    username: '',
    roles: [{ id: 0, name: 'STUDENT' }]
  };
  success = '';
  error = '';
  selectedRole = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadUser(id);
  }

  loadUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.selectedRole = data.roles[0]?.name || '';
      },
      error: () => this.error = 'Failed to load user details'
    });
  }

  updateUser() {
    this.user.roles = [{ id: 0, name: this.selectedRole as any }];

    this.userService.updateUser(this.user).subscribe({
      next: () => {
        this.success = 'User updated successfully!';
        setTimeout(() => this.router.navigate(['/manage-users']), 1200);
      },
      error: () => this.error = 'Failed to update user'
    });
  }
}
