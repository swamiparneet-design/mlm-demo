import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserRole,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../models/auth.model';
import { ToastService } from './toast.service';

const SESSION_STORAGE_KEY = 'mlm.auth.session';

/** setTimeout has a ~24.8 day ceiling; cap the scheduled delay well under that. */
const MAX_TIMER_DELAY_MS = 2_000_000_000;

/**
 * Signal-based auth store. The in-memory signal is the source of truth while
 * the app is running; a serialized snapshot is mirrored into sessionStorage
 * purely so a page refresh can rehydrate state (cleared when the tab closes,
 * unlike localStorage - a reasonable middle ground for a JWT demo app).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private expiryTimer?: ReturnType<typeof setTimeout>;

  private readonly _currentUser = signal<AuthenticatedUser | null>(this.readFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly role = computed<UserRole | null>(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => {
    const role = this.role();
    return role === 'Admin' || role === 'SuperAdmin';
  });
  readonly token = computed(() => this._currentUser()?.token ?? null);

  constructor(private readonly http: HttpClient) {
    const restored = this._currentUser();
    if (restored) {
      this.scheduleExpiryTimer(restored.expiresAtUtc);
    }
  }

  /**
   * Re-checks expiry on demand (used by route guards on every navigation, not
   * just at login/page-load time) so a token that expired while the tab was
   * idle is caught immediately rather than waiting for the next failed API call.
   */
  hasValidSession(): boolean {
    const user = this._currentUser();
    if (!user) {
      return false;
    }
    if (new Date(user.expiresAtUtc).getTime() <= Date.now()) {
      this.expireSession();
      return false;
    }
    return true;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((response) => this.setSession(response)),
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${environment.apiUrl}/auth/verify-otp`, request);
  }

  logout(): void {
    this.clearExpiryTimer();
    this._currentUser.set(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  /** Called when the token expires while the user is actively using the app. */
  private expireSession(): void {
    const wasAuthenticated = this.isAuthenticated();
    this.logout();
    if (wasAuthenticated) {
      this.toast.error('Session expired', 'Your session has ended. Please sign in again to continue.');
      this.router.navigate(['/login']);
    }
  }

  private setSession(response: LoginResponse): void {
    const user: AuthenticatedUser = {
      userId: response.userId,
      fullName: response.fullName,
      role: response.role,
      token: response.token,
      expiresAtUtc: response.expiresAtUtc,
    };
    this._currentUser.set(user);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.scheduleExpiryTimer(user.expiresAtUtc);
  }

  private scheduleExpiryTimer(expiresAtUtc: string): void {
    this.clearExpiryTimer();
    const delay = new Date(expiresAtUtc).getTime() - Date.now();
    if (delay <= 0) {
      this.expireSession();
      return;
    }
    this.expiryTimer = setTimeout(() => this.expireSession(), Math.min(delay, MAX_TIMER_DELAY_MS));
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }

  private readFromStorage(): AuthenticatedUser | null {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as AuthenticatedUser;
      if (new Date(parsed.expiresAtUtc).getTime() <= Date.now()) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
