import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  // inject() must run here (interceptor invocation), not inside RxJS callbacks — see NG0203.
  const auth = inject(AuthService);
  const router = inject(Router);

  // Only attach credentials for our backend API.
  // External services (e.g. Nominatim/ipapi) will fail CORS if credentials are sent.
  const isAbsoluteHttp = /^https?:\/\//i.test(req.url);
  const isOurApi =
    (isAbsoluteHttp && req.url.startsWith(environment.apiUrl)) ||
    (!isAbsoluteHttp && req.url.startsWith('/'));

  const authReq = isOurApi ? req.clone({ withCredentials: true }) : req;

  const isAuthLoginAttempt =
    req.method === 'POST' &&
    req.url.replace(/\?.*$/, '').endsWith('/api/auth/login');

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 on login/register = wrong credentials / validation — do not clear session or redirect.
      if (error.status === 401 && !isAuthLoginAttempt) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        auth.setSession(null);
        router.navigate(['/login'], {
          queryParams: { reason: 'session_expired' },
        });
      }
      return throwError(() => error);
    })
  );
};