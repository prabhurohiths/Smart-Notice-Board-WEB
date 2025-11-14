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
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';


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

  // Dropdown state variables
  departmentDropdownOpen = false;
  yearDropdownOpen = false;
  roleDropdownOpen = false;

  selectedDepartment = '';
  selectedYearName = '';
  selectedRole = '';

  usernameInput$ = new Subject<string>();
  usernameExists: boolean | null = null; // null = unknown


  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private yearService: YearService,
    private roleService: RoleService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDepartments();
    this.loadYears();
    this.loadRoles();

    // Debounced username check
    this.usernameInput$
      .pipe(
        debounceTime(0),
        switchMap(username => this.userService.checkUsernameExists(username))
      )
      .subscribe({
        next: (res) => this.usernameExists = res.exists,
        error: () => this.usernameExists = null
      });
  }

  onUsernameInput(username: string) {
    this.usernameExists = null; // reset status
    this.usernameInput$.next(username);
  }


  // Fetch data from backend
  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        // remove "ALL" departments if present
        this.departments = data.filter(dept => dept.name.toUpperCase() !== 'ALL');
      }
    });
  }

  loadYears() {
    this.yearService.getAllYears().subscribe({
      next: (data) => {
        // remove year option if it's something like "ALL" or yearNumber = 0
        this.years = data.filter(y => y.yearName.toUpperCase() !== 'ALL' && y.yearNumber !== 0);
      }
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => this.roles = data
    });
  }

  // Dropdown Toggles
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

  // Dropdown Selections
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

    // Disable department & year for ADMIN or TEACHER
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.departmentDropdownOpen = false;
      this.yearDropdownOpen = false;
      this.roleDropdownOpen = false;
    }
  }


  addUser() {
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

    // Passwords
    if (!this.tempPassword?.trim()) {
      this.error = "Temporary password is required.";
      return;
    }

    if (!this.confirmPassword?.trim()) {
      this.error = "Confirm password is required.";
      return;
    }

    // Password Match
    if (this.tempPassword !== this.confirmPassword) {
      this.error = "Passwords do not match.";
      return;
    }

    // Role
    if (!this.selectedRole) {
      this.error = "Role selection is required.";
      return;
    }

    // Username already exists
    if (this.usernameExists === true) {
      this.error = "This username is already taken.";
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

    // Encrypt password
    this.user.password = this.userService.encryptPassword(this.tempPassword);

    //Register User API
    this.userService.registerUser(this.user).subscribe({
      next: () => {
        this.success = "✅ User added successfully!";
        this.error = "";
        setTimeout(() => this.router.navigate(['/manage-users']), 1000);
      },
      error: (err) => {
        this.error = err.error?.message || "❌ Failed to add user.";
        this.success = "";
      }
    });
  }

}