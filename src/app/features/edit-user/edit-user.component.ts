import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { DepartmentService } from '../../core/services/department.service';
import { YearService } from '../../core/services/year.service';
import { RoleService } from '../../core/services/role.service';
import { User } from '../../core/models/user.model';
import { Department } from '../../core/models/department.model';
import { Year } from '../../core/models/year.model';
import { Role } from '../../core/models/role.model';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-edit-user',
  standalone: false,
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user: User = { username: '', roles: [{ id: 0, name: 'STUDENT' }] };
  success = '';
  error = '';

  departments: Department[] = [];
  years: Year[] = [];
  roles: Role[] = [];

  selectedDepartment = '';
  selectedYearName = '';
  selectedRole = '';

  departmentDropdownOpen = false;
  yearDropdownOpen = false;
  roleDropdownOpen = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private departmentService: DepartmentService,
    private yearService: YearService,
    private roleService: RoleService,
    public router: Router
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    forkJoin({
      user: this.userService.getUserById(id),
      departments: this.departmentService.getAllDepartments(),
      years: this.yearService.getAllYears(),
      roles: this.roleService.getAllRoles()
    }).subscribe({
      next: ({ user, departments, years, roles }) => {
        this.user = user;
        this.departments = departments;
        this.years = years.filter(y => y.yearName.toUpperCase() !== 'ALL' && y.yearNumber !== 0);
        this.roles = roles;

        this.selectedRole = user.roles[0]?.name ?? '';
        this.selectedDepartment = user.department ?? '';

        // now years are loaded, so this works correctly
        this.selectedYearName = this.getYearLabel(user.year ?? 0);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load user details.';
      }
    });
  }

  loadUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.selectedRole = data.roles[0]?.name ?? '';
        this.selectedDepartment = data.department ?? '';
        this.selectedYearName = this.getYearLabel(data.year ?? 0);
      },
      error: () => (this.error = 'Failed to load user details')
    });
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => (this.departments = data)
    });
  }

  loadYears() {
    this.yearService.getAllYears().subscribe({
      next: (data) => (this.years = data)
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => (this.roles = data)
    });
  }

  // Dropdown handling
  toggleDepartmentDropdown() {
    this.departmentDropdownOpen = !this.departmentDropdownOpen;
    this.yearDropdownOpen = false;
    this.roleDropdownOpen = false;
  }

  toggleYearDropdown() {
    this.yearDropdownOpen = !this.yearDropdownOpen;
    this.departmentDropdownOpen = false;
    this.roleDropdownOpen = false;
  }

  toggleRoleDropdown() {
    this.roleDropdownOpen = !this.roleDropdownOpen;
    this.departmentDropdownOpen = false;
    this.yearDropdownOpen = false;
  }

  selectDepartment(dept: Department, event: Event) {
    event.stopPropagation();
    this.selectedDepartment = dept.name;
    this.user.department = dept.name;
    this.departmentDropdownOpen = false;
  }

  selectYear(year: Year, event: Event) {
    event.stopPropagation();
    this.selectedYearName = year.yearName;
    this.user.year = year.yearNumber;
    this.yearDropdownOpen = false;
  }

  selectRole(role: Role, event: Event) {
    event.stopPropagation();
    this.selectedRole = role.name;
    this.user.roles = [{ id: 0, name: role.name }];
    this.roleDropdownOpen = false;

    // If Admin or Teacher → clear department/year
    if (role.name === 'ADMIN' || role.name === 'TEACHER') {
      this.selectedDepartment = '';
      this.selectedYearName = '';
      this.user.department = '';
      this.user.year = 0;
    }
  }

  isRoleRestricted(): boolean {
    return this.selectedRole === 'ADMIN' || this.selectedRole === 'TEACHER';
  }

  getYearLabel(yearNumber: number): string {
    const match = this.years.find((y) => y.yearNumber === yearNumber);
    return match ? match.yearName : '';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.departmentDropdownOpen = false;
      this.yearDropdownOpen = false;
      this.roleDropdownOpen = false;
    }
  }


  updateUser() {
    this.success = "";
    this.error = "";

    //BASIC FIELD VALIDATION

    // Username
    if (!this.user.username?.trim()) {
      this.error = "Username is required.";
      return;
    }

    // Full Name
    if (!this.user.name?.trim()) {
      this.error = "Full name is required.";
      return;
    }

    // Role
    if (!this.selectedRole) {
      this.error = "Role selection is required.";
      return;
    }

    //ROLE-BASED VALIDATION
    if (this.selectedRole === "STUDENT") {
      if (!this.selectedDepartment) {
        this.error = "Department is required for students.";
        return;
      }
      if (!this.selectedYearName) {
        this.error = "Year is required for students.";
        return;
      }
    }

    //EMAIL VALIDATION
    if (!this.user.gmail?.trim()) {
      this.error = "Email is required.";
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.gmail)) {
      this.error = "Invalid email format.";
      return;
    }

    //MOBILE VALIDATION
    if (!this.user.mobileNumber?.trim()) {
      this.error = "Mobile number is required.";
      return;
    }
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(this.user.mobileNumber)) {
      this.error = "Mobile number must be a 10-digit number.";
      return;
    }

    //DATE OF BIRTH VALIDATION
    if (!this.user.dateOfBirth?.trim()) {
      this.error = "Date of birth is required.";
      return;
    }
    const dob = new Date(this.user.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 15) {
      this.error = "User must be at least 15 years old.";
      return;
    }

    //Update User API
    this.userService.updateUser(this.user).subscribe({
      next: () => {
        this.success = '✅ User updated successfully!';
        this.error = '';
        setTimeout(() => this.router.navigate(['/manage-users']), 200);
      },
      error: () => {
        this.error = '❌ Failed to update user.';
        this.success = '';
      }
    });
  }

}
