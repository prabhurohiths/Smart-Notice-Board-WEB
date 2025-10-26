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
  notice: Notice = { title: '', description: '', department: '', branch: '', year: 0, section: '' };
  success = '';
  error = '';

  constructor(private noticeService: NoticeService, private router: Router) { }

  postNotice() {
    this.noticeService.postNotice(this.notice).subscribe({
      next: () => {
        this.success = 'Notice posted successfully!';
        this.router.navigate(['/notices']);
      },
      error: err => this.error = err.error?.message || 'Error posting notice'
    });
  }
}