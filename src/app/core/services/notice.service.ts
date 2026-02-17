import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Notice } from '../models/notice.model';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NoticeService {

  private apiUrl = 'http://localhost:8080/';

  private noticeToEdit: Notice | null = null;

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
  }

  setNoticeToEdit(notice: Notice) {
    this.noticeToEdit = notice;
  }

  getNoticeToEdit(): Notice | null {
    return this.noticeToEdit;
  }

  getNoticeById(id: number): Observable<Notice> {
    return this.http.get<Notice>(`${this.apiUrl}api/notices/getNoticeById/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAllNotices(page: number, size: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}api/notices/getAllNotices?page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
  }


  updateNoticeWithImages(id: number, notice: Notice, files: File[]): Observable<any> {
    const formData = new FormData();

    // Clean up the notice before sending
    const cleanNotice = {
      ...notice,
      imagePaths: notice.imageFileNames || [] // send file names, not base64
    };

    formData.append('notice', new Blob([JSON.stringify(cleanNotice)], { type: 'application/json' }));

    if (files && files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }

    return this.http.put(`${this.apiUrl}api/notices/updateNoticeWithImages/${id}`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` })
    });
  }

  getStudentNotices(page: number, size: number): Observable<any> {
    const user = this.auth.getLoggedUser();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (user) {
      if (user.department) params = params.set('department', user.department);
      if (user.year) params = params.set('year', user.year.toString());
    }

    return this.http.get<any>(`${this.apiUrl}api/notices/getStudentNotices`, {
      headers: this.getHeaders(),
      params
    });
  }

  deleteNotice(id: number, userId: any): Observable<any> {
    return this.http.delete<Notice[]>(`${this.apiUrl}api/notices/deleteNotice/${id}?userId=${userId}`, { headers: this.getHeaders() });
  }

  postNotice(notice: Notice, postedById: any, files?: File[]): Observable<Notice> {
    const formData = new FormData();
    formData.append('notice', new Blob([JSON.stringify(notice)], { type: 'application/json' }));

    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }

    return this.http.post<Notice>(
      `${this.apiUrl}api/notices/createNotice?postedById=${postedById}`,
      formData
    );
  }

  // Filter notices by.. for (Admin/Teachers)
  filterNotices(postedBy?: string, year?: number, uploadedYear?: number, department?: string, page: number = 0, size: number = 6): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (postedBy) params = params.set('postedBy', postedBy);
    if (year !== undefined && year !== null) { // send 0 for all years
      params = params.set('year', year.toString());
    }
    if (uploadedYear) params = params.set('uploadedYear', uploadedYear.toString());
    if (department) params = params.set('department', department);

    return this.http.get<any>(`${this.apiUrl}api/notices/filterNotices`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Filter notices by.. for (Students)
  studentFilterNotices(postedBy?: string, uploadedYear?: number, department?: string, year?: number, page: number = 0, size: number = 6): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (postedBy) params = params.set('postedBy', postedBy);
    if (uploadedYear) params = params.set('uploadedYear', uploadedYear.toString());
    if (department) params = params.set('department', department);
    if (year !== undefined && year !== null) params = params.set('year', year.toString());

    return this.http.get<any>(`${this.apiUrl}api/notices/studentFilterNotices`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Fetch all teachers and admins
  getAllTeachersAndAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}user/getAllTeachersAndAdmins`, {
      headers: this.getHeaders()
    });
  }

}
