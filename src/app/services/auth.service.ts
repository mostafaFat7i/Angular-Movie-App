import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  private userId: number | null = null;
  private readonly loginUrl = 'http://localhost:8090/login';
  private readonly registerUrl = 'http://localhost:8090/register';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { email, password }).pipe(
      tap(response => {
        if (response.token && response.role) {
          this.setToken(response.token);
          this.setUserRole(response.role);
          this.setUserId(response.userId);
        } else {
          console.error('Login response missing token or role');
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(this.registerUrl, { username, email, password });
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userRole'); // Clear user role
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Method to set user role after login
  setUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  setUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }
  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  }

  // Method to get user role
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

}
