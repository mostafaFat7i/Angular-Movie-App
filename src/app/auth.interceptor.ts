import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service'; // Import your AuthService
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the authentication token from your AuthService
    const authToken = this.authService.getToken(); // Implement this method in AuthService

    // Skip adding token for login or register requests
    if (request.url.includes('/login') || request.url.includes('/register')) {
      return next.handle(request); // Proceed without token
    }

    // Clone the request and set the new header
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized error globally
        if (error.status === 401) {
          // Redirect to login or show a message
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
