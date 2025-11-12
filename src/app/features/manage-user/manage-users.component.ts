import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  standalone: false,
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  currentPage = 0;
  pageSize = 3;
  totalPages = 0;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.users;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  editUser(user: User) {
    this.router.navigate(['/edit-user', user.id]);
  }

  deleteUser(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'TEACHER': return 'role-teacher';
      case 'STUDENT': return 'role-student';
      default: return '';
    }
  }
}
