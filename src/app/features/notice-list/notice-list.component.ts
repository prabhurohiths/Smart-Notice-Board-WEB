import { Component, OnInit } from '@angular/core';
import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-notice-list',
  standalone: false,
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.css']
})
export class NoticeListComponent implements OnInit {

  notices: Notice[] = [];

  constructor(private noticeService: NoticeService, private authService: AuthService) { }

  ngOnInit() {
    const user = this.authService.getLoggedUser();
    console.log("user -- ", user)
    if (user?.roles[0].name == "ADMIN") {
      this.noticeService.getAllNotices().subscribe({
        next: (data) => {
          console.log('API response:', data);
          this.notices = data;
        },
        error: (err) => {
          console.error('Error fetching notices:', err);
        }
      });
    } else if (user?.roles[0].name == 'TEACHER') {
      this.noticeService.getAllNotices().subscribe({
        next: (data) => {
          console.log('API response:', data);
          this.notices = data;
        },
        error: (err) => {
          console.error('Error fetching notices:', err);
        }
      });
    } else {
      this.noticeService.getStudentNotices().subscribe({
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


  deleteNotice(noticeId: any): void {
    const user = this.authService.getLoggedUser();

    if (!user) return;

    if (confirm("Are you sure you want to delete this notice?")) {
      this.noticeService.deleteNotice(noticeId, user.id).subscribe({
        next: () => {
          this.notices = this.notices.filter(n => n.id !== noticeId);
          alert("Notice deleted successfully!");
        },
        error: (err) => {
          alert(err.error?.message || "You don't have permission to delete this notice.");
        }
      });
    }
  }

  canDeleteNotice(notice: Notice): boolean {
    const user = this.authService.getLoggedUser();

    if (!user) return false;

    const role = user.roles[0].name;
    if (role === 'ADMIN') return true;
    if (role === 'TEACHER' && notice.postedBy === user.username) return true;

    return false;
  }


  openImageInNewTab(base64Image: string): void {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`<img src="${base64Image}" style="width:100%; height:auto;" />`);
      newTab.document.title = "Notice Image";
    } else {
      alert('Please allow popups for this site.');
    }
  }

}
