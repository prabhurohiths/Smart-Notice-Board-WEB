import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';

@Component({
  selector: 'app-notice-post',
  standalone: false,
  templateUrl: './notice-post.component.html',
  styleUrls: ['./notice-post.component.css']
})
export class NoticePostComponent {
  notice: Notice = { title: '', description: '', department: '', year: 0 };
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  success = '';
  error = '';

  constructor(private noticeService: NoticeService, private router: Router) { }

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
    const postedById = 1; // Replace with logged-in user ID

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
}
