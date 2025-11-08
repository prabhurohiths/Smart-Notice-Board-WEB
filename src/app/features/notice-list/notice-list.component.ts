import { Component, OnInit } from '@angular/core';
import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notice-list',
  standalone: false,
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.css']
})
export class NoticeListComponent implements OnInit {

  notices: Notice[] = [];
  teachersAndAdmins: any[] = [];

  selectedUser: string = '';
  selectedYear: number | null = null;
  selectedUploadedYear: number | null = null;
  selectedDepartment: string = '';

  years: number[] = [1, 2, 3, 4];
  uploadedYears: number[] = [2023, 2024, 2025];
  departments: string[] = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']; // Modify as needed

  userDropdownOpen = false;
  yearDropdownOpen = false;
  uploadedYearDropdownOpen = false;
  departmentDropdownOpen = false;

  constructor(private noticeService: NoticeService, public authService: AuthService, private router: Router) { }

  ngOnInit() {
    const user = this.authService.getLoggedUser();

    if (user?.roles?.[0]?.name === 'ADMIN') {
      this.loadAllNotices();
      this.loadTeachersAndAdmins();
    } else if (user?.roles?.[0]?.name === 'TEACHER') {
      this.loadAllNotices();
      this.loadTeachersAndAdmins();
    } else {
      this.loadStudentNotices();
    }
  }

  get isAdmin(): boolean {
    const user = this.authService.getLoggedUser();
    return user?.roles?.some(r => r.name === 'ADMIN') || false;
  }

  get isTeacher(): boolean {
    const user = this.authService.getLoggedUser();
    return user?.roles?.some(r => r.name === 'TEACHER') || false;
  }

  // Load Notices Based on Role
  loadAllNotices() {
    this.noticeService.getAllNotices().subscribe({
      next: (data) => (this.notices = data),
      error: (err) => console.error('Error fetching notices:', err)
    });
  }

  loadStudentNotices() {
    this.noticeService.getStudentNotices().subscribe({
      next: (data) => (this.notices = data),
      error: (err) => console.error('Error fetching student notices:', err)
    });
  }

  loadTeachersAndAdmins() {
    this.noticeService.getAllTeachersAndAdmins().subscribe({
      next: (data) => (this.teachersAndAdmins = data),
      error: (err) => console.error('Error loading teachers/admins:', err)
    });
  }

  // Dropdown Toggles
  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    this.closeOtherDropdowns('user');
  }

  toggleYearDropdown() {
    this.yearDropdownOpen = !this.yearDropdownOpen;
    this.closeOtherDropdowns('year');
  }

  toggleUploadedYearDropdown() {
    this.uploadedYearDropdownOpen = !this.uploadedYearDropdownOpen;
    this.closeOtherDropdowns('uploadedYear');
  }

  toggleDepartmentDropdown() {
    this.departmentDropdownOpen = !this.departmentDropdownOpen;
    this.closeOtherDropdowns('department');
  }

  // Helper to close other dropdowns
  private closeOtherDropdowns(openDropdown: string) {
    if (openDropdown !== 'user') this.userDropdownOpen = false;
    if (openDropdown !== 'year') this.yearDropdownOpen = false;
    if (openDropdown !== 'uploadedYear') this.uploadedYearDropdownOpen = false;
    if (openDropdown !== 'department') this.departmentDropdownOpen = false;
  }

  // Selection Handlers
  selectUser(username: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedUser = username;
    this.userDropdownOpen = false;
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedYear = year;
    this.yearDropdownOpen = false;
  }

  selectUploadedYear(year: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedUploadedYear = year;
    this.uploadedYearDropdownOpen = false;
  }

  selectDepartment(dept: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedDepartment = dept;
    this.departmentDropdownOpen = false;
  }

  // Display year label (1st, 2nd, etc.)
  getYearLabel(year: number): string {
    const suffixes = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    return suffixes[year - 1] || `${year} Year`;
  }

  // Apply Filters (now includes department)
  applyFilters() {
    this.noticeService
      .filterNoticesByUserAndYear(
        this.selectedUser,
        this.selectedYear || undefined,
        this.selectedUploadedYear || undefined,
        this.selectedDepartment || undefined
      )
      .subscribe({
        next: (data) => (this.notices = data),
        error: (err) => console.error('Error applying filters:', err)
      });
  }

  // Reset Filters
  resetFilters() {
    this.selectedUser = '';
    this.selectedYear = null;
    this.selectedUploadedYear = null;
    this.selectedDepartment = '';
    this.loadAllNotices();
  }

  canEditNotice(notice: Notice): boolean {
    const user = this.authService.getLoggedUser();
    if (!user) return false;

    const role = user.roles[0].name;
    if (role === 'ADMIN') return true;
    if (role === 'TEACHER' && notice.postedBy === user.username) return true;

    return false;
  }

  editNotice(notice: Notice): void {
    this.noticeService.setNoticeToEdit(notice);
    this.router.navigate(['/edit-notice', notice.id]);// navigate to edit page
  }


  // Delete Notice Logic
  deleteNotice(noticeId: any): void {
    const user = this.authService.getLoggedUser();
    if (!user) return;

    if (confirm('Are you sure you want to delete this notice?')) {
      this.noticeService.deleteNotice(noticeId, user.id).subscribe({
        next: () => {
          this.notices = this.notices.filter((n) => n.id !== noticeId);
          alert('Notice deleted successfully!');
        },
        error: (err) => {
          alert(err.error?.message || "You don't have permission to delete this notice.");
        }
      });
    }
  }

  // Permission Check
  canDeleteNotice(notice: Notice): boolean {
    const user = this.authService.getLoggedUser();
    if (!user) return false;

    const role = user.roles[0].name;
    if (role === 'ADMIN') return true;
    if (role === 'TEACHER' && notice.postedBy === user.username) return true;

    return false;
  }

  // Open Image in New Tab
  openImageInNewTab(base64Image: string): void {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`<img src="${base64Image}" style="width:100%; height:auto;" />`);
      newTab.document.title = 'Notice Image';
    } else {
      alert('Please allow popups for this site.');
    }
  }
}
