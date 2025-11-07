import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notice-post',
  standalone: false,
  templateUrl: './notice-post.component.html',
  styleUrls: ['./notice-post.component.css']
})
export class NoticePostComponent {
  notice: Notice = { title: '', description: '', department: '', year: null as any };
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  success = '';
  error = '';

  //Custom Selection Dropdown
  departmentDropdownOpen = false;
  yearDropdownOpen = false;
  departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'ALL'];
  years = [1, 2, 3, 4, 0]; // 0 for "All Years"

  constructor(private noticeService: NoticeService, private router: Router, private authService: AuthService) { }

  onFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files as FileList) as File[];

    // ✅ Append new files to existing list instead of replacing
    this.selectedFiles = [...this.selectedFiles, ...newFiles];

    // ✅ Generate previews for the newly added files only
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });

    // ✅ Optional: Reset file input value so the same file can be reselected
    event.target.value = '';
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  postNotice() {
    let user = this.authService.getLoggedUser();
    const postedById = user?.id;

    this.noticeService.postNotice(this.notice, postedById, this.selectedFiles).subscribe({
      next: () => {
        this.success = 'Notice posted successfully!';
        this.router.navigate(['/notices']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error posting notice';
      }
    });
  }

  // Toggle dropdowns
  toggleDepartmentDropdown() {
    this.departmentDropdownOpen = !this.departmentDropdownOpen;
    this.yearDropdownOpen = false; // close other dropdown
  }

  toggleYearDropdown() {
    this.yearDropdownOpen = !this.yearDropdownOpen;
    this.departmentDropdownOpen = false; // close other dropdown
  }

  // Select handlers
  selectDepartment(dept: string, event: Event) {
    event.stopPropagation();
    this.notice.department = dept;
    this.departmentDropdownOpen = false;
  }

  selectYear(year: number, event: Event) {
    event.stopPropagation();
    this.notice.year = year;
    this.yearDropdownOpen = false;
  }

  // Helper to show label for year
  getYearLabel(year: number): string {
    if (year === 0) return 'All Years';
    if (year === 1) return '1st Year';
    if (year === 2) return '2nd Year';
    if (year === 3) return '3rd Year';
    if (year === 4) return '4th Year';
    return '';
  }

  // Optional: close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.departmentDropdownOpen = false;
      this.yearDropdownOpen = false;
    }
  }

}
