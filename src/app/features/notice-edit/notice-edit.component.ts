import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoticeService } from '../../core/services/notice.service';
import { Notice } from '../../core/models/notice.model';

@Component({
  selector: 'app-notice-edit',
  standalone: false,
  templateUrl: './notice-edit.component.html',
  styleUrls: ['./notice-edit.component.css']
})
export class NoticeEditComponent implements OnInit {

  notice: Notice = { id: undefined, title: '', description: '', department: '', year: null as any, imagePaths: [] };
  success = '';
  error = '';
  departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ALL'];
  years = [1, 2, 3, 4, 0];  // 0 for "All Years"
  previewUrls: string[] = [];
  selectedFiles: File[] = [];  // Handle image re-upload

  constructor(
    private noticeService: NoticeService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/notices']);
      return;
    }
    this.loadNoticeData(id);
  }

  loadNoticeData(id: number) {
    this.noticeService.getNoticeById(id).subscribe({
      next: (data) => {
        this.notice = data;
        this.previewUrls = data.imagePaths || [];
        // retain backend file names for accurate update reference
        this.notice.imageFileNames = data.imageFileNames || [];
      },
      error: (err) => {
        this.error = 'Failed to load notice details.';
      }
    });
  }

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

  updateNotice() {
    if (!this.notice.id) return;
    // This notice object now has only the remaining imagePaths
    this.noticeService.updateNoticeWithImages(this.notice.id, this.notice, this.selectedFiles).subscribe({
      next: () => {
        this.success = 'Notice updated successfully!';
        setTimeout(() => this.router.navigate(['/notices']), 1000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error updating notice';
      }
    });
  }

}
