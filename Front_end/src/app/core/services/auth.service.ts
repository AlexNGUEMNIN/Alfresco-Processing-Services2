import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenExpiryTimer?: any;
  private currentUserSubject = new BehaviorSubject<TokenResponse | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  private tokenUrl = 'http://localhost:8085/realms/aps-realm/protocol/openid-connect/token';
  private clientId = 'aps';
  private clientSecret = 'O8EqOMlzrUKWlM3BO0NbMzIBoRRLEsL0'; // Replace with real secret

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('auth_tokens');
    if (saved) this.currentUserSubject.next(JSON.parse(saved));
  }

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username,
      password,
    });

    return this.http
        .post<TokenResponse>(this.tokenUrl, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .pipe(
            map(tokens => {
              this.storeTokens(tokens);
              this.scheduleRefresh(tokens.expires_in);
              return tokens;
            }),
            catchError((err: HttpErrorResponse) => throwError(() => err))
        );
  }

  logout() {
    localStorage.removeItem('auth_tokens');
    this.currentUserSubject.next(null);
    clearTimeout(this.tokenExpiryTimer);
    this.router.navigate(['/login']);
  }

  get accessToken(): string | null {
    return this.currentUserSubject.value?.access_token ?? null;
  }

  private storeTokens(tokens: TokenResponse) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    this.currentUserSubject.next(tokens);
  }

  private scheduleRefresh(expiresInSec: number) {
    if (this.tokenExpiryTimer) clearTimeout(this.tokenExpiryTimer);
    const refreshTime = (expiresInSec - 60) * 1000;
    this.tokenExpiryTimer = setTimeout(() => this.refreshToken().subscribe(), refreshTime);
  }

  refreshToken(): Observable<TokenResponse> {
    const current = this.currentUserSubject.value;
    if (!current) return throwError(() => new Error('No token to refresh'));

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: current.refresh_token,
    });

    return this.http
        .post<TokenResponse>(this.tokenUrl, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .pipe(
            map(tokens => {
              this.storeTokens(tokens);
              this.scheduleRefresh(tokens.expires_in);
              return tokens;
            }),
            catchError(err => {
              this.logout();
              return throwError(() => err);
            })
        );
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value?.access_token;
  }
}
