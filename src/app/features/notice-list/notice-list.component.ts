import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Department } from '../../core/models/department.model';
import { Notice } from '../../core/models/notice.model';
import { Year } from '../../core/models/year.model';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { NoticeService } from '../../core/services/notice.service';
import { YearService } from '../../core/services/year.service';
import Swal from 'sweetalert2';

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

  years: Year[] = [];
  uploadedYears: number[] = [2023, 2024, 2025];
  departments: Department[] = [];

  userDropdownOpen = false;
  yearDropdownOpen = false;
  uploadedYearDropdownOpen = false;
  departmentDropdownOpen = false;

  isFiltered: boolean = false;

  filterCriteria = {
    postedBy: '',
    year: undefined as number | undefined,
    uploadedYear: undefined as number | undefined,
    department: undefined as string | undefined
  };

  //pagination variables
  currentPage = 0;
  pageSize = 6;
  totalPages = 0;

  constructor(
    private noticeService: NoticeService,
    private departmentService: DepartmentService,
    private yearService: YearService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    const user = this.authService.getLoggedUser();
    // Load filters
    this.loadDepartments();
    this.loadYears();
    this.loadTeachersAndAdmins();
    // Load notices based on role
    if (user?.roles?.[0]?.name === 'ADMIN' || user?.roles?.[0]?.name === 'TEACHER') {
      this.loadAllNotices();
    } else {
      this.loadStudentNotices();
    }
  }

  // Load departments dynamically
  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  // Load year levels dynamically
  loadYears() {
    this.yearService.getAllYears().subscribe({
      next: (data) => this.years = data,
      error: (err) => console.error('Failed to load years', err)
    });
  }

  get isAdmin(): boolean {
    const user = this.authService.getLoggedUser();
    return user?.roles?.some(r => r.name === 'ADMIN') || false;
  }

  get isTeacher(): boolean {
    const user = this.authService.getLoggedUser();
    return user?.roles?.some(r => r.name === 'TEACHER') || false;
  }

  loadAllNotices() {
    this.noticeService.getAllNotices(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.notices = res.notices;
        this.totalPages = res.totalPages;
      },
      error: (err) => console.error('Error fetching notices:', err)
    });
  }

  loadStudentNotices() {
    this.noticeService.getStudentNotices(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.notices = res.notices;
        this.totalPages = res.totalPages;
      },
      error: (err) => console.error('Error fetching student notices:', err)
    });
  }

  loadTeachersAndAdmins() {
    this.noticeService.getAllTeachersAndAdmins().subscribe({
      next: (data) => (this.teachersAndAdmins = data),
      error: (err) => console.error('Error loading teachers/admins:', err)
    });
  }

  // Filter Dropdown Logic
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

  private closeOtherDropdowns(openDropdown: string) {
    if (openDropdown !== 'user') this.userDropdownOpen = false;
    if (openDropdown !== 'year') this.yearDropdownOpen = false;
    if (openDropdown !== 'uploadedYear') this.uploadedYearDropdownOpen = false;
    if (openDropdown !== 'department') this.departmentDropdownOpen = false;
  }

  // Selections
  selectUser(username: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedUser = username;
    this.userDropdownOpen = false;
  }

  selectYear(year: Year, event: MouseEvent) {
    event.stopPropagation();
    this.selectedYear = year.yearNumber;
    this.yearDropdownOpen = false;
  }

  selectUploadedYear(year: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedUploadedYear = year;
    this.uploadedYearDropdownOpen = false;
  }

  selectDepartment(dept: Department, event: MouseEvent) {
    event.stopPropagation();
    this.selectedDepartment = dept.name;
    this.departmentDropdownOpen = false;
  }

  // Label for Year (fetched dynamically)
  getYearLabel(yearNumber: number): string {
    const found = this.years.find(y => y.yearNumber === yearNumber);
    return found ? found.yearName : '';
  }

  isExpired(expiryDate: string | null | undefined): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    return exp < today;
  }

  isExpiringSoon(expiryDate: string | null | undefined): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 2;
  }

  isImage(file: string): boolean {
    return file.startsWith('data:image');
  }

  isPDF(file: string): boolean {
    return file.includes('.pdf') || file.startsWith('data:application/pdf');
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

  // Filter Actions
  applyFilters() {
    const user = this.authService.getLoggedUser();

    if (!this.isAdmin && !this.isTeacher) {
      // Student filter — new API
      this.filterCriteria = {
        postedBy: this.selectedUser || '',
        uploadedYear: this.selectedUploadedYear || undefined,
        department: user?.department || undefined,
        year: user?.year || undefined
      };

      this.isFiltered = true;

      this.noticeService
        .studentFilterNotices(
          this.filterCriteria.postedBy,
          this.filterCriteria.uploadedYear,
          this.filterCriteria.department,
          this.filterCriteria.year,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            this.notices = res.notices;
            this.totalPages = res.totalPages;
          },
          error: (err) => console.error('Error applying student filters:', err)
        });

    } else {
      // Admin/Teacher same logic as before
      this.filterCriteria = {
        postedBy: this.selectedUser || '',
        year: this.selectedYear !== undefined && this.selectedYear !== null
          ? this.selectedYear
          : undefined,
        uploadedYear: this.selectedUploadedYear || undefined,
        department: this.selectedDepartment || undefined
      };

      this.isFiltered = true;

      this.noticeService
        .filterNotices(
          this.filterCriteria.postedBy,
          this.filterCriteria.year,
          this.filterCriteria.uploadedYear,
          this.filterCriteria.department,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            this.notices = res.notices;
            this.totalPages = res.totalPages;
          },
          error: (err) => console.error('Error applying filters:', err)
        });
    }
  }

  resetFilters() {
    this.selectedUser = '';
    this.selectedYear = null;
    this.selectedUploadedYear = null;
    this.selectedDepartment = '';
    this.isFiltered = false;

    this.filterCriteria = {
      postedBy: '',
      year: undefined,
      uploadedYear: undefined,
      department: undefined
    };

    this.currentPage = 0;

    if (this.isAdmin || this.isTeacher) {
      this.loadAllNotices();
    } else {
      this.loadStudentNotices();
    }
  }


  canEditNotice(notice: Notice): boolean {
    const user = this.authService.getLoggedUser();
    if (!user) return false;

    const role = user.roles[0].name;
    return role === 'ADMIN' || (role === 'TEACHER' && notice.postedBy === user.username);
  }

  editNotice(notice: Notice): void {
    this.noticeService.setNoticeToEdit(notice);
    this.router.navigate(['/app/notices/edit-notice', notice.id]);
  }

  deleteNotice(noticeId: any): void {
    const user = this.authService.getLoggedUser();
    if (!user) return;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this notice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        // Call API to delete
        this.noticeService.deleteNotice(noticeId, user.id).subscribe({
          next: () => {
            this.notices = this.notices.filter(n => n.id !== noticeId);

            Swal.fire({
              title: "Deleted!",
              text: "The notice has been deleted.",
              icon: "success",
              confirmButtonColor: "#3085d6"
            });
          },
          error: (err) => {
            Swal.fire({
              title: "Error!",
              text: err.error?.message || "You don't have permission to delete this notice.",
              icon: "error",
              confirmButtonColor: "#3085d6"
            });
          }
        });

      } else {
        Swal.fire({
          title: "Cancelled",
          text: "The notice was not deleted.",
          icon: "info",
          confirmButtonColor: "#3085d6"
        });
      }
    });
  }

  canDeleteNotice(notice: Notice): boolean {
    const user = this.authService.getLoggedUser();
    if (!user) return false;

    const role = user.roles[0].name;
    return role === 'ADMIN' || (role === 'TEACHER' && notice.postedBy === user.username);
  }

  openImageInNewTab(base64Image: string): void {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`<img src="${base64Image}" style="width:100%; height:auto;" />`);
      newTab.document.title = 'Notice Image';
    } else {
      alert('Please allow popups for this site.');
    }
  }

  // Pagination settings
  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;

    if (this.isFiltered) {
      if (this.isAdmin || this.isTeacher) {
        this.loadFilteredNotices();
      } else {
        this.loadStudentFilteredNotices();
      }
    } else if (this.isAdmin || this.isTeacher) {
      this.loadAllNotices();
    } else {
      this.loadStudentNotices();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;

      if (this.isFiltered) {
        if (this.isAdmin || this.isTeacher) {
          this.loadFilteredNotices();
        } else {
          this.loadStudentFilteredNotices();
        }
      } else if (this.isAdmin || this.isTeacher) {
        this.loadAllNotices();
      } else {
        this.loadStudentNotices();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;

      if (this.isFiltered) {
        if (this.isAdmin || this.isTeacher) {
          this.loadFilteredNotices();
        } else {
          this.loadStudentFilteredNotices();
        }
      } else if (this.isAdmin || this.isTeacher) {
        this.loadAllNotices();
      } else {
        this.loadStudentNotices();
      }
    }
  }

  loadFilteredNotices() {
    this.noticeService
      .filterNotices(
        this.filterCriteria.postedBy,
        this.filterCriteria.year,
        this.filterCriteria.uploadedYear,
        this.filterCriteria.department,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.notices = res.notices;
          this.totalPages = res.totalPages;
        },
        error: (err) => console.error('Error fetching filtered notices:', err)
      });
  }

  loadStudentFilteredNotices() {
    const user = this.authService.getLoggedUser();
    if (!user) return;

    this.noticeService
      .studentFilterNotices(
        this.filterCriteria.postedBy,
        this.filterCriteria.uploadedYear,
        user.department,
        user.year,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.notices = res.notices;
          this.totalPages = res.totalPages;
        },
        error: (err) => console.error('Error fetching filtered student notices:', err)
      });
  }

}