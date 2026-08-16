import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiErrorPayload } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Converts any failed API call into a friendly toast instead of letting it
 * fail silently. Validation (400) errors are flattened into a readable list;
 * everything else falls back to a short human message.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          toast.error('Connection problem', 'Could not reach the server. Please check your connection and try again.');
        } else if (error.status === 401) {
          const wasAuthenticated = auth.isAuthenticated();
          auth.logout();
          if (wasAuthenticated) {
            toast.error('Session expired', 'Please sign in again to continue.');
            router.navigate(['/login']);
          } else {
            toast.error('Invalid credentials', getMessage(error));
          }
        } else if (error.status === 403) {
          toast.error('Access denied', 'You do not have permission to perform this action.');
        } else if (error.status === 404) {
          toast.error('Not found', getMessage(error) || 'The requested resource could not be found.');
        } else if (error.status === 400 || error.status === 409 || error.status === 422) {
          toast.error(error.status === 409 ? 'Conflict' : 'Please check your input', getMessage(error));
        } else if (error.status >= 500) {
          toast.error('Something went wrong', 'An unexpected server error occurred. Please try again shortly.');
        } else {
          toast.error('Request failed', getMessage(error));
        }
      } else {
        toast.error('Unexpected error', 'Something went wrong. Please try again.');
      }

      return throwError(() => error);
    }),
  );
};

function getMessage(error: HttpErrorResponse): string {
  const payload = error.error as ApiErrorPayload | undefined;
  if (!payload) {
    return error.message || 'Please try again.';
  }

  if (payload.errors && Object.keys(payload.errors).length > 0) {
    return Object.values(payload.errors).flat().join(' ');
  }

  return payload.message || 'Please try again.';
}
