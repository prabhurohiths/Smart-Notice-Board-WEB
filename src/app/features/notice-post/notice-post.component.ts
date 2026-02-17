import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Department } from '../../core/models/department.model';
import { Notice } from '../../core/models/notice.model';
import { Year } from '../../core/models/year.model';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { NoticeService } from '../../core/services/notice.service';
import { YearService } from '../../core/services/year.service';

@Component({
  selector: 'app-notice-post',
  standalone: false,
  templateUrl: './notice-post.component.html',
  styleUrls: ['./notice-post.component.css']
})
export class NoticePostComponent implements OnInit {

  notice: Notice = { title: '', description: '', department: '', year: null as any, expiryDate: '' };
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  success = '';
  error = '';

  // Dropdowns
  departmentDropdownOpen = false;
  yearDropdownOpen = false;

  departments: Department[] = [];
  years: Year[] = [];
  today = new Date().toISOString().split('T')[0];

  constructor(
    private noticeService: NoticeService,
    private departmentService: DepartmentService,
    private yearService: YearService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDepartments();
    this.loadYears();
  }

  // Load from backend
  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => this.departments = data,
      error: () => console.error('Failed to load departments')
    });
  }

  loadYears() {
    this.yearService.getAllYears().subscribe({
      next: (data) => this.years = data,
      error: () => console.error('Failed to load years')
    });
  }

  onFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files as FileList);

    newFiles.forEach((file: File) => {
      this.selectedFiles.push(file);

      // If image → show image preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.previewUrls.push(e.target.result);
        reader.readAsDataURL(file);
      }
      // If PDF → generate object URL
      else if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);  // 👈 ADD THIS HERE
        this.previewUrls.push(url);
      }
    });

    // Clear input
    event.target.value = '';
  }

  openPDF(file: any) {
    // CASE 1: Already a Blob URL (from new uploaded file)
    if (typeof file === 'string' && file.startsWith('blob:')) {
      window.open(file, '_blank');
      return;
    }

    // CASE 2: Base64 PDF from backend
    if (typeof file === 'string' && file.startsWith('data:application/pdf')) {
      const base64Data = file.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      return;
    }

    // CASE 3: File object (File from input)
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      return;
    }
    console.warn('Unsupported PDF format:', file);
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  postNotice() {
    this.success = "";
    this.error = "";

    //REQUIRED FIELD CHECKS

    // Title
    if (!this.notice.title || !this.notice.title.trim()) {
      this.error = "Title is required.";
      return;
    }
    this.notice.title = this.notice.title.trim();

    // Description
    if (!this.notice.description || !this.notice.description.trim()) {
      this.error = "Description is required.";
      return;
    }
    this.notice.description = this.notice.description.trim();

    // Department
    if (!this.notice.department || !this.notice.department.trim()) {
      this.error = "Department is required.";
      return;
    }

    // Expiry Date
    if (!this.notice.expiryDate) {
      this.error = "Expiry date is required.";
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (this.notice.expiryDate < today) {
      this.error = "Expiry date cannot be in the past.";
      return;
    }

    // Year
    if (
      this.notice.year === null ||
      this.notice.year === undefined ||
      isNaN(this.notice.year)
    ) {
      this.error = "Year is required.";
      return;
    }

    //PREPARE API CALL
    const user = this.authService.getLoggedUser();
    const postedById = user?.id;

    if (!postedById) {
      this.error = "Unable to identify user.";
      return;
    }

    //Create Notice API
    this.noticeService
      .postNotice(this.notice, postedById, this.selectedFiles)
      .subscribe({
        next: () => {
          this.success = "Notice posted successfully!";
          setTimeout(() => this.router.navigate(['/app/notices']), 500);
        },
        error: (err) => {
          this.error = err.error?.message || "Error posting notice.";
        }
      });
  }

  // Dropdown controls
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
    this.notice.department = dept.name;
    this.departmentDropdownOpen = false;
  }

  selectYear(year: Year, event: Event) {
    event.stopPropagation();
    this.notice.year = year.yearNumber;
    this.yearDropdownOpen = false;
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
