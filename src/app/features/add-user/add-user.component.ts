import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { DepartmentService } from '../../core/services/department.service';
import { YearService } from '../../core/services/year.service';
import { RoleService } from '../../core/services/role.service';
import { User } from '../../core/models/user.model';
import { Department } from '../../core/models/department.model';
import { Year } from '../../core/models/year.model';
import { Role } from '../../core/models/role.model';

@Component({
  selector: 'app-add-user',
  standalone: false,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  user: User = {
    username: '',
    name: '',
    mobileNumber: '',
    dateOfBirth: '',
    gmail: '',
    department: '',
    year: 0,
    roles: [{ id: 0, name: 'ADMIN' }]
  };

  departments: Department[] = [];
  years: Year[] = [];
  roles: Role[] = [];

  tempPassword = '';
  confirmPassword = '';
  success = '';
  error = '';

  // ✅ Dropdown state variables
  departmentDropdownOpen = false;
  yearDropdownOpen = false;
  roleDropdownOpen = false;

  selectedDepartment = '';
  selectedYearName = '';
  selectedRole = '';

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private yearService: YearService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadYears();
    this.loadRoles();
  }

  // ✅ Fetch data from backend
  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => this.departments = data
    });
  }

  loadYears() {
    this.yearService.getAllYears().subscribe({
      next: (data) => this.years = data
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => this.roles = data
    });
  }

  // ✅ Dropdown Toggles
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

  // ✅ Dropdown Selections
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
    this.user.roles[0].name = role.name;
    this.roleDropdownOpen = false;
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

  // ✅ Create user
  addUser() {
    if (!this.user.username || !this.tempPassword || !this.confirmPassword || !this.user.department || !this.user.roles[0].name) {
      this.error = 'Please fill all required fields.';
      this.success = '';
      return;
    }

    if (this.tempPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      this.success = '';
      return;
    }

    this.user.password = this.userService.encryptPassword(this.tempPassword);

    this.userService.registerUser(this.user).subscribe({
      next: () => {
        this.success = '✅ User added successfully!';
        setTimeout(() => this.router.navigate(['/manage-users']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || '❌ Error adding user.';
      }
    });
  }
}
