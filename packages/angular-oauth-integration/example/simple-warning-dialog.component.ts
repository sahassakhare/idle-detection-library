import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'simple-warning-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="warning-overlay" *ngIf="visible">
      <div class="warning-dialog">
        <div class="warning-header">
          <h2>⚠️ Session Timeout Warning</h2>
          <div class="countdown-circle">
            <span class="countdown-text">{{ countdownTime() }}</span>
          </div>
        </div>
        
        <div class="warning-content">
          <p>Your session is about to expire due to inactivity.</p>
          <p>You will be automatically logged out in <strong>{{ countdownTime() }} seconds</strong>.</p>
        </div>
        
        <div class="warning-actions">
          <button 
            class="btn btn-primary" 
            (click)="onExtendSession()"
            [attr.aria-label]="'Extend session to continue working'"
          >
            <span>🔄</span> Extend Session
          </button>
          
          <button 
            class="btn btn-secondary" 
            (click)="onLogout()"
            [attr.aria-label]="'Logout and end session'"
          >
            <span>🚪</span> Logout Now
          </button>
        </div>
        
        <div class="warning-progress">
          <div 
            class="progress-bar" 
            [style.width.%]="progressPercentage()"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .warning-dialog {
      background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
      border-radius: 20px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      color: white;
      text-align: center;
      position: relative;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { 
        transform: translateY(-50px) scale(0.9);
        opacity: 0;
      }
      to { 
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    
    .warning-header {
      margin-bottom: 25px;
    }
    
    .warning-header h2 {
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .countdown-circle {
      width: 80px;
      height: 80px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .countdown-text {
      font-size: 24px;
      font-weight: 800;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .warning-content {
      margin-bottom: 25px;
      line-height: 1.6;
    }
    
    .warning-content p {
      margin: 10px 0;
      font-size: 16px;
    }
    
    .warning-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 150px;
      justify-content: center;
    }
    
    .btn-primary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-primary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
    
    .btn-secondary {
      background: rgba(0, 0, 0, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .btn-secondary:hover {
      background: rgba(0, 0, 0, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
    
    .warning-progress {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #FFE066, #FF6B6B);
      transition: width 1s linear;
      border-radius: 3px;
    }
    
    @media (max-width: 600px) {
      .warning-dialog {
        padding: 20px;
        margin: 20px;
      }
      
      .warning-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class SimpleWarningDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visible = false;
  @Input() initialTime = 30; // seconds
  @Output() extendSession = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  countdownTime = signal(30);
  progressPercentage = signal(100);

  ngOnInit(): void {
    if (this.visible) {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    if (this.visible) {
      this.countdownTime.set(this.initialTime);
      this.progressPercentage.set(100);
      this.startCountdown();
    } else {
      this.destroy$.next();
    }
  }

  private startCountdown(): void {
    this.destroy$.next(); // Stop any existing countdown
    
    interval(1000).pipe(
      takeUntil(this.destroy$),
      map((tick) => this.initialTime - tick - 1)
    ).subscribe(remaining => {
      this.countdownTime.set(Math.max(0, remaining));
      this.progressPercentage.set((remaining / this.initialTime) * 100);
      
      if (remaining <= 0) {
        this.onLogout();
      }
    });
  }

  onExtendSession(): void {
    console.log('🔄 Extending session from warning dialog');
    this.extendSession.emit();
  }

  onLogout(): void {
    console.log('🚪 Logout from warning dialog');
    this.logout.emit();
  }
}