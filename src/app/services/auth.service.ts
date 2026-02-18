import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

const AUTH_KEY = 'auth-user';
const REMEMBER_KEY = 'auth-remember';

export interface User {
  email: string;
  name: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }

  login(email: string, password: string, rememberMe = false): boolean {
    if (email === 'admin@example.com' && password === 'password') {
      const user: User = { email, name: 'Admin', role: 'Administrator' };
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      if (rememberMe) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        localStorage.setItem(REMEMBER_KEY, 'true');
      } else {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
