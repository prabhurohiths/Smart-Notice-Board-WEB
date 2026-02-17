import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Department } from '../../core/models/department.model';
import { Year } from '../../core/models/year.model';
import { DepartmentService } from '../../core/services/department.service';
import { YearService } from '../../core/services/year.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: false,
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    user: User = { username: '', roles: [] };
    
    // Separate messages for profile and password
    profileSuccess = '';
    profileError = '';
    passwordSuccess = '';
    passwordError = '';

    newPassword = '';
    confirmPassword = '';

    departments: Department[] = [];
    years: Year[] = [];

    selectedDepartment = '';
    selectedYearName = '';

    departmentDropdownOpen = false;
    yearDropdownOpen = false;

    constructor(
        private userService: UserService,
        private departmentService: DepartmentService,
        private yearService: YearService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        const loggedUser = this.authService.getLoggedUser();
        if (!loggedUser) {
            this.router.navigate(['/login']);
            return;
        }

        forkJoin({
            user: this.userService.getUserById(loggedUser.id!),
            departments: this.departmentService.getAllDepartments(),
            years: this.yearService.getAllYears()
        }).subscribe({
            next: ({ user, departments, years }) => {
                this.user = user;
                this.departments = departments.filter(d => d.name.toUpperCase() !== 'ALL');
                this.years = years.filter(y => y.yearName.toUpperCase() !== 'ALL' && y.yearNumber !== 0);
                this.selectedDepartment = user.department ?? '';
                this.selectedYearName = this.getYearLabel(user.year ?? 0);
            }
        });
    }

    updateProfile() {
        // Clear all messages
        this.profileSuccess = '';
        this.profileError = '';
        this.passwordSuccess = '';
        this.passwordError = '';

        if (!this.user.name?.trim()) {
            this.profileError = "Full name required.";
            return;
        }
        if (!this.user.gmail?.trim()) {
            this.profileError = "Email required.";
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.user.gmail)) {
            this.profileError = "Invalid email.";
            return;
        }

        // ROLE BASED VALIDATION (Only for Students)
        if (!this.isRoleRestricted()) {
            if (!this.selectedDepartment) {
                this.profileError = "Department is required for students.";
                return;
            }
            if (!this.selectedYearName) {
                this.profileError = "Year is required for students.";
                return;
            }
        }

        //MOBILE VALIDATION
        if (!this.user.mobileNumber?.trim()) {
            this.profileError = "Mobile number is required.";
            return;
        }
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(this.user.mobileNumber)) {
            this.profileError = "Mobile number must be a 10-digit number.";
            return;
        }

        //DATE OF BIRTH VALIDATION
        if (!this.user.dateOfBirth?.trim()) {
            this.profileError = "Date of birth is required.";
            return;
        }
        const dob = new Date(this.user.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 15) {
            this.profileError = "User must be at least 15 years old.";
            return;
        }

        this.userService.updateUser(this.user).subscribe({
            next: () => this.profileSuccess = "Profile updated successfully!",
            error: () => this.profileError = "Failed to update profile."
        });
    }

    changePassword() {
        // Clear all messages
        this.profileSuccess = '';
        this.profileError = '';
        this.passwordSuccess = '';
        this.passwordError = '';

        if (!this.newPassword.trim() || !this.confirmPassword.trim()) {
            this.passwordError = "Password fields cannot be empty";
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.passwordError = "Passwords do not match";
            return;
        }

        this.userService.resetPassword(this.user.username, this.newPassword).subscribe({
            next: () => {
                this.passwordSuccess = "Password updated successfully!";
                this.newPassword = "";
                this.confirmPassword = "";
            },
            error: () => this.passwordError = "Failed to update password."
        });
    }

    toggleDepartmentDropdown() {
        this.departmentDropdownOpen = !this.departmentDropdownOpen;
        this.yearDropdownOpen = false;
    }

    toggleYearDropdown() {
        this.yearDropdownOpen = !this.yearDropdownOpen;
        this.departmentDropdownOpen = false;
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

    isRoleRestricted() {
        const role = this.user.roles[0]?.name;
        return role === 'ADMIN' || role === 'TEACHER';
    }

    getYearLabel(yearNumber: number): string {
        const match = this.years.find(y => y.yearNumber === yearNumber);
        return match ? match.yearName : '';
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.custom-dropdown')) {
            this.departmentDropdownOpen = false;
            this.yearDropdownOpen = false;
        }
    }

}