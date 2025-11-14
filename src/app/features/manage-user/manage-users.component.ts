import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

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

    // Find the user to delete
    const userToDelete = this.users.find(u => u.id === id);
    if (!userToDelete) {
      Swal.fire("Error", "User not found.", "error");
      return;
    }

    const username = userToDelete.username; // Username to match

    // FIRST CONFIRMATION
    Swal.fire({
      title: "Are you sure?",
      text: `User "${username}" will be permanently deleted along with all notices posted by the user.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Continue",
      cancelButtonText: "Cancel"
    }).then((first) => {

      if (!first.isConfirmed) {
        Swal.fire({
          title: "Cancelled",
          text: "User deletion cancelled.",
          icon: "info"
        });
        return;
      }

      // SECOND CONFIRMATION — TYPE THE USERNAME
      Swal.fire({
        title: "Final Confirmation",
        html: `To confirm deletion, type <b>${username}</b> below.`,
        input: "text",
        inputPlaceholder: `Type ${username} here`,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete User",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (value !== username) {
            return `You must type "${username}" exactly to confirm.`;
          }
          return null;
        }
      }).then((second) => {

        if (!second.isConfirmed) {
          Swal.fire({
            title: "Cancelled",
            text: "User deletion cancelled.",
            icon: "info"
          });
          return;
        }

        // API CALL
        this.userService.deleteUser(id).subscribe({
          next: () => {
            Swal.fire({
              title: "Deleted!",
              text: `User "${username}" has been permanently removed.`,
              icon: "success"
            });
            this.loadUsers();
          },
          error: (err) => {
            Swal.fire({
              title: "Error!",
              text: err.error?.message || "Failed to delete user.",
              icon: "error"
            });
          }
        });

      });

    });
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
