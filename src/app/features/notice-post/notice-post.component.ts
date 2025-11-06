// import { Component } from '@angular/core';

// import { Router } from '@angular/router';
// import { Notice } from '../../core/models/notice.model';
// import { NoticeService } from '../../core/services/notice.service';

// @Component({
//   selector: 'app-notice-post',
//   standalone: false,
//   templateUrl: './notice-post.component.html'
// })
// export class NoticePostComponent {
//   notice: Notice = { title: '', description: '', department: '', year: 0 };
//   success = '';
//   error = '';

//   constructor(private noticeService: NoticeService, private router: Router) { }

//   postNotice() {
//     let postedById = 1;
//     this.noticeService.postNotice(this.notice, postedById).subscribe({
//       next: () => {
//         this.success = 'Notice posted successfully!';
//         this.router.navigate(['/notices']);
//       },
//       error: err => this.error = err.error?.message || 'Error posting notice'
//     });
//   }
// }


import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';

@Component({
  selector: 'app-notice-post',
  standalone: false,
  templateUrl: './notice-post.component.html'
})
export class NoticePostComponent {
  notice: Notice = { title: '', description: '', department: '', year: 0 };
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  success = '';
  error = '';

  constructor(private noticeService: NoticeService, private router: Router) {}

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);

    // Preview selected images
    this.previewUrls = [];
    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
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
