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
    // Validate basic fields
    if (!this.user.username || !this.selectedRole) {
      this.error = 'Please fill all required fields.';
      this.success = '';
      return;
    }

    // Validate Department/Year for Students only
    const role = this.selectedRole;
    if (role === 'STUDENT') {
      if (!this.user.department || !this.user.year) {
        this.error = 'Department and Year are required for Student role.';
        this.success = '';
        return;
      }
    }

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
