import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface MockUserData {
  sub: string;
  name: string;
  email: string;
  role?: string;
  userRole?: string;
  roles?: string[];
}

export interface MockAuthResult {
  isAuthenticated: boolean;
  userData?: MockUserData;
}

@Injectable({
  providedIn: 'root'
})
export class MockOidcSecurityService {
  private authState = new BehaviorSubject<MockAuthResult>({ 
    isAuthenticated: true,
    userData: {
      sub: 'mock-user-123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'user'
    }
  });

  private userData = new BehaviorSubject<MockUserData | null>({
    sub: 'mock-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'user'
  });

  get isAuthenticated$(): Observable<MockAuthResult> {
    return this.authState.asObservable();
  }

  get userData$(): Observable<MockUserData | null> {
    return this.userData.asObservable();
  }

  forceRefreshSession(): Observable<any> {
    console.log('Mock: Refreshing session...');
    return of({ success: true });
  }

  logoff(): Observable<any> {
    console.log('Mock: Logging off...');
    this.authState.next({ isAuthenticated: false });
    this.userData.next(null);
    return of({ success: true });
  }

  // Mock methods for testing
  setUserRole(role: string): void {
    const currentUser = this.userData.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      this.userData.next(updatedUser);
      this.authState.next({ 
        isAuthenticated: true, 
        userData: updatedUser 
      });
    }
  }

  login(): void {
    this.authState.next({ 
      isAuthenticated: true,
      userData: {
        sub: 'mock-user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'user'
      }
    });
    this.userData.next({
      sub: 'mock-user-123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'user'
    });
  }
}