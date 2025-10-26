import { Component, OnInit } from '@angular/core';
import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-notice-list',
  standalone: false,
  templateUrl: './notice-list.component.html'
})
export class NoticeListComponent implements OnInit {

  notices: Notice[] = [];

  constructor(private noticeService: NoticeService, private authService: AuthService) { }

 ngOnInit() {
  this.noticeService.getAllNotices().subscribe({
    next: (data) => {
      console.log('API response:', data);
      this.notices = data;
    },
    error: (err) => {
      console.error('Error fetching notices:', err);
    }
  });
}


}
