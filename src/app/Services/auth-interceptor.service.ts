import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {

  const authReq = req.clone({ withCredentials: true });

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