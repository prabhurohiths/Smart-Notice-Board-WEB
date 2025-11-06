import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Notice } from '../models/notice.model';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NoticeService {

  private apiUrl = 'http://localhost:8080/api/notices';

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
  }

  getAllNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(`${this.apiUrl}/getAllNotices`, { headers: this.getHeaders() });
  }

  getStudentNotices(): Observable<Notice[]> {
    const user = this.auth.getLoggedUser();
    let params = new HttpParams();
    if (user) {
      if (user.department) params = params.set('department', user.department);
      if (user.year) params = params.set('year', user.year.toString());
    }
    return this.http.get<Notice[]>(`${this.apiUrl}/getStudentNotices`, { headers: this.getHeaders(), params });
  }
  

  postNotice(notice: Notice, postedById: any, files?: File[]): Observable<Notice> {
    const formData = new FormData();

    // ✅ Must match the @RequestPart("noticeDto") in Spring Boot
    formData.append('notice', new Blob([JSON.stringify(notice)], { type: 'application/json' }));

    if (files && files.length > 0) {
      files.forEach(file => formData.append('images', file));
    }

    return this.http.post<Notice>(
      `${this.apiUrl}/createNotice?postedById=${postedById}`,
      formData
    );
  }


}
