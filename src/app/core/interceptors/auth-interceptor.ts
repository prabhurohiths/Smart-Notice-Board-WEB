import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth-response.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Always get the latest token from AuthService
    const token = this.authService.getToken();
    let authReq = req;

    if (token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only trigger refresh for 401 (expired/invalid token)
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((res: AuthResponse) => {
          this.isRefreshing = false;
          console.log('🔄 Received new tokens:', res);

          // Save new tokens
          this.authService.saveToken(res.accessToken, res.refreshToken);

          // Emit new access token for queued requests
          this.refreshTokenSubject.next(res.accessToken);

          // Retry original request with new token
          return next.handle(this.addTokenHeader(req, res.accessToken));
        }),
        catchError(err => {
          this.isRefreshing = false;
          console.error('Refresh token failed, logging out');
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      // If refresh is in progress, queue other requests
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(this.addTokenHeader(req, token!)))
      );
    }
  }

  private refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.authService.getRefreshToken();
    console.log('⚡ Refreshing token with refreshToken:', refreshToken);

    return this.http.post<AuthResponse>(
      `${this.authService.basePath}user/refreshAccessToken`,
      { refreshToken } // backend expects body with refreshToken
    );
  }
}
