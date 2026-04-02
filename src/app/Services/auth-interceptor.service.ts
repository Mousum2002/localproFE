import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {

  // Only attach credentials for our backend API.
  // External services (e.g. Nominatim/ipapi) will fail CORS if credentials are sent.
  const isAbsoluteHttp = /^https?:\/\//i.test(req.url);
  const isOurApi =
    (isAbsoluteHttp && req.url.startsWith(environment.apiUrl)) ||
    (!isAbsoluteHttp && req.url.startsWith('/'));

  const authReq = isOurApi ? req.clone({ withCredentials: true }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
        // Sessione scaduta: sincronizziamo lo stato UI e reindirizziamo al login.
      if (error.status === 401) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        inject(AuthService).setSession(null);
        inject(Router).navigate(['/login'], {
          queryParams: { reason: 'session_expired' }
        });
      }
      return throwError(() => error);
    })
  );
};