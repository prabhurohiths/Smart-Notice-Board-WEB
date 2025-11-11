import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoticeService } from '../../core/services/notice.service';
import { Notice } from '../../core/models/notice.model';
import { DepartmentService } from '../../core/services/department.service';
import { YearService } from '../../core/services/year.service';
import { Department } from '../../core/models/department.model';
import { Year } from '../../core/models/year.model';

@Component({
  selector: 'app-notice-edit',
  standalone: false,
  templateUrl: './notice-edit.component.html',
  styleUrls: ['./notice-edit.component.css']
})
export class NoticeEditComponent implements OnInit {

  notice: Notice = {
    id: undefined,
    title: '',
    description: '',
    department: '',
    year: null as any,
    imagePaths: []
  };

  success = '';
  error = '';
  departments: Department[] = [];
  years: Year[] = [];
  previewUrls: string[] = [];
  selectedFiles: File[] = [];

  // ✅ Dropdown states
  departmentDropdownOpen = false;
  yearDropdownOpen = false;

  constructor(
    private noticeService: NoticeService,
    private departmentService: DepartmentService,
    private yearService: YearService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/notices']);
      return;
    }

    this.loadNoticeData(id);
    this.loadDepartments();
    this.loadYears();
  }

  // ✅ Load dynamic data
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

  // ✅ Load existing notice
  loadNoticeData(id: number) {
    this.noticeService.getNoticeById(id).subscribe({
      next: (data) => {
        this.notice = data;
        this.previewUrls = data.imagePaths || [];
        this.notice.imageFileNames = data.imageFileNames || [];
      },
      error: () => {
        this.error = 'Failed to load notice details.';
      }
    });
  }

  // ✅ Dropdown control
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
    const found = this.years.find(y => y.yearNumber === yearNumber);
    return found ? found.yearName : '';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.departmentDropdownOpen = false;
      this.yearDropdownOpen = false;
    }
  }

  // ✅ File upload
  onFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files as FileList) as File[];
    this.selectedFiles = [...this.selectedFiles, ...newFiles];

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  removeImage(index: number) {
    this.previewUrls.splice(index, 1);

    if (this.notice.imagePaths && this.notice.imagePaths.length > index) {
      this.notice.imagePaths.splice(index, 1);
    }

    if (this.notice.imageFileNames && this.notice.imageFileNames.length > index) {
      this.notice.imageFileNames.splice(index, 1);
    }

    if (index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
    }
  }

  // ✅ Update notice
  updateNotice() {
    if (!this.notice.id) return;

    this.noticeService.updateNoticeWithImages(this.notice.id, this.notice, this.selectedFiles).subscribe({
      next: () => {
        this.success = '✅ Notice updated successfully!';
        setTimeout(() => this.router.navigate(['/notices']), 1000);
      },
      error: (err) => {
        this.error = err.error?.message || '❌ Error updating notice.';
      }
    });
  }
}
