import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSignal = signal<User | null>(null);
  public isAuthenticated = signal(false);

  isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');
  isVendor = computed(() => this.currentUserSignal()?.role === 'Vendor');
  isCustomer = computed(() => this.currentUserSignal()?.role === 'Customer');

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) return;

    try {
      const user = JSON.parse(userStr);
      this.currentUserSignal.set(user);
      this.isAuthenticated.set(true);
    } catch {
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storeAuthData(response);
    this.currentUserSignal.set(response.user);
    this.isAuthenticated.set(true);
    this.navigateByRole(response.user?.role);
  }

  private navigateByRole(role: string | undefined): void {
    if (role === 'Vendor') {
      this.router.navigate(['/vendor']);
    } else if (role === 'Admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  private clearAuthState(): void {
    localStorage.clear();
    this.currentUserSignal.set(null);
    this.isAuthenticated.set(false);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, request);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token });
  }

  refreshToken(): Observable<AuthResponse> {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { token, refreshToken }).pipe(
      tap(response => this.storeAuthData(response)),
      catchError(() => {
        this.logout();
        return of();
      })
    );
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  currentUser(): User | null {
    return this.currentUserSignal();
  }

  hasRole(role: string): boolean {
    return this.currentUserSignal()?.role === role;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  updateCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }
}