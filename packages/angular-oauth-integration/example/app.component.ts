import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent,
  IdleWarningData 
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app">
      <h1>Idle Detection Demo</h1>
      
      <div class="status">
        <p>Status: {{ idleStatus$ | async }}</p>
        <p>Is Idle: {{ isIdle$ | async }}</p>
        <p>Is Warning: {{ isWarning$ | async }}</p>
        <p>Time Remaining: {{ timeRemaining$ | async }}</p>
      </div>

      <div class="actions">
        <button (click)="extendSession()">Extend Session</button>
        <button (click)="logout()">Logout</button>
      </div>

      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        titleText="Session Expiring Soon"
        messageText="Your session will expire due to inactivity."
        extendText="Continue Working"
        logoutText="End Session"
        (extendSession)="onExtendSession()"
        (logout)="onLogout()"
      ></idle-warning-dialog>
    </div>
  `,
  styles: [`
    .app {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .status {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .actions {
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #007bff;
      color: white;
    }
    
    button:hover {
      background: #0056b3;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  idleStatus$ = this.idleOAuthService.idleStatus$;
  isIdle$ = this.idleOAuthService.isIdle$;
  isWarning$ = this.idleOAuthService.isWarning$;
  timeRemaining$ = this.idleOAuthService.timeRemaining$;
  
  showWarning = false;
  warningData!: IdleWarningData;

  constructor(private idleOAuthService: IdleOAuthService) {}

  ngOnInit(): void {
    // Initialize the service with configuration
    this.idleOAuthService.initialize({
      idleTimeout: 10000, // 10 seconds for demo
      warningTimeout: 5000, // 5 seconds warning
      autoRefreshToken: true,
      multiTabCoordination: true
    });

    // Start idle detection
    this.idleOAuthService.start();

    // Subscribe to warning state
    this.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      this.showWarning = isWarning;
      
      if (isWarning) {
        // Always refresh warning data to ensure callbacks are current
        console.log('🔄 Refreshing warningData for dialog');
        this.warningData = this.idleOAuthService.getCurrentWarningData()!;
        console.log('🔍 Fresh warningData:', this.warningData);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleOAuthService.stop();
  }

  extendSession(): void {
    this.idleOAuthService.extendSession();
  }

  logout(): void {
    this.idleOAuthService.logout();
  }

  onExtendSession(): void {
    console.log('📱 APP COMPONENT: onExtendSession() called');
    // Call service first, then hide dialog
    this.extendSession();
    this.showWarning = false;
  }

  onLogout(): void {
    this.showWarning = false;
    this.logout();
  }
}