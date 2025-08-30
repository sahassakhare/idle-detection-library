import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';
import { CustomTemplateExampleComponent } from './custom-template-example.component';
import { TemplateRefExampleComponent } from './template-ref-example.component';
import { CustomActionsExampleComponent } from './custom-actions-example.component';
import { ContentProjectionTestComponent } from './content-projection-test.component';
import { ManualControlExampleComponent } from './manual-control-example.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IdleWarningDialogComponent, CustomTemplateExampleComponent, TemplateRefExampleComponent, CustomActionsExampleComponent, ContentProjectionTestComponent, ManualControlExampleComponent],
  template: `
    <div class="container">
      <h1>Angular Idle Detection Demo</h1>
      <p class="subtitle">Complete Idle Detection Solution with Industry Standard Security</p>
      
      <!-- Navigation Tabs -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'basic'"
          (click)="activeTab = 'basic'">
          Basic Demo
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'custom-template'"
          (click)="activeTab = 'custom-template'">
          Custom Template
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'template-ref'"
          (click)="activeTab = 'template-ref'">
          Template Reference
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'custom-actions'"
          (click)="activeTab = 'custom-actions'">
          Custom Actions
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'content-test'"
          (click)="activeTab = 'content-test'">
          Content Projection Test
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'manual-control'"
          (click)="activeTab = 'manual-control'">
          Manual Control (Resume/Pause)
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'css-custom'"
          (click)="activeTab = 'css-custom'">
          CSS Customization
        </button>
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Basic Demo Tab -->
        <div *ngIf="activeTab === 'basic'">
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">TIMER</div>
              <div class="feature-title">Auto Idle Detection</div>
              <div class="feature-description">Automatically monitors user activity</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">SECURE</div>
              <div class="feature-title">Secure Dialog</div>
              <div class="feature-description">No backdrop clicks (industry standard)</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">FAST</div>
              <div class="feature-title">Zero Setup</div>
              <div class="feature-description">Just add one component tag</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">STYLE</div>
              <div class="feature-title">Customizable</div>
              <div class="feature-description">Themes, timeouts, and messages</div>
            </div>
          </div>
          
          <div class="demo-controls">
            <button class="btn btn-primary" (click)="logEvent('User clicked demo button')">
              Test Activity Detection
            </button>
            <button class="btn btn-secondary" (click)="clearLog()">
              Clear Log
            </button>
          </div>
          
          <!-- Basic Idle Warning Dialog -->
          <idle-warning-dialog
            [idleTimeout]="60000"
            [warningTimeout]="20000"
            [enableMultiTab]="true"
            [enableDebugLogs]="true"
            [multiTabChannelName]="'demo-idle-channel'"
            [onLogoutCallback]="handleLogout"
            [onExtendCallback]="handleExtend"
            dialogTitle="Session Timeout Warning"
            dialogMessage="Your session is about to expire due to inactivity. Would you like to continue?"
            extendButtonText="Yes, Continue"
            logoutButtonText="No, Logout"
            theme="default"
            size="medium"
            (activityDetected)="onActivityDetected($event)"
            (idleStart)="onIdleStart()"
            (idleEnd)="onIdleEnd()"
            (warningStart)="onWarningStart()"
            (warningEnd)="onWarningEnd()"
            (sessionExtended)="onSessionExtended()"
            (sessionTimeout)="onSessionTimeout()">
          </idle-warning-dialog>
          
          <div class="event-log">
            <h3>Activity Log</h3>
            <div class="log-content">
              <div *ngFor="let event of eventLog" class="event-item">
                <span class="event-time">{{ event.timestamp }}</span>
                <span class="event-message">{{ event.message }}</span>
              </div>
              <div *ngIf="eventLog.length === 0" class="no-events">
                Move your mouse, type, or click to see activity detection in action.
              </div>
            </div>
          </div>
        </div>
        
        <!-- Custom Template Tab -->
        <div *ngIf="activeTab === 'custom-template'">
          <app-custom-template-example></app-custom-template-example>
        </div>
        
        <!-- Template Reference Tab -->
        <div *ngIf="activeTab === 'template-ref'">
          <app-template-ref-example></app-template-ref-example>
        </div>
        
        <!-- Custom Actions Tab -->
        <div *ngIf="activeTab === 'custom-actions'">
          <app-custom-actions-example></app-custom-actions-example>
        </div>
        
        <!-- Content Projection Test Tab -->
        <div *ngIf="activeTab === 'content-test'">
          <app-content-projection-test></app-content-projection-test>
        </div>
        
        <!-- Manual Control Tab -->
        <div *ngIf="activeTab === 'manual-control'">
          <app-manual-control-example></app-manual-control-example>
        </div>
        
        <!-- CSS Customization Tab -->
        <div *ngIf="activeTab === 'css-custom'">
          <div class="css-custom-section">
            <h2>CSS Class Customization Example</h2>
            <p>This example demonstrates how to completely customize the look and feel of the idle warning dialog using CSS class inputs.</p>
            
            <div class="customization-info">
              <h3>Available CSS Class Inputs:</h3>
              <ul>
                <li><code>backdropClass</code> - Overlay background</li>
                <li><code>dialogClass</code> - Main dialog container</li>
                <li><code>headerClass</code> - Dialog header section</li>
                <li><code>titleClass</code> - Title text</li>
                <li><code>bodyClass</code> - Body content area</li>
                <li><code>messageClass</code> - Warning message text</li>
                <li><code>countdownClass</code> - Countdown timer wrapper</li>
                <li><code>progressClass</code> - Progress bar container</li>
                <li><code>actionsClass</code> - Button container</li>
                <li><code>primaryButtonClass</code> - Primary button styling</li>
                <li><code>secondaryButtonClass</code> - Secondary button styling</li>
              </ul>
            </div>
            
            <!-- Customized Idle Warning Dialog -->
            <idle-warning-dialog
              [idleTimeout]="45000"
              [warningTimeout]="15000"
              [enableMultiTab]="false"
              dialogTitle="Session Alert"
              dialogMessage="Your session will expire soon due to inactivity. Please choose an action to continue."
              extendButtonText="Continue Working"
              logoutButtonText="Sign Out"
              backdropClass="premium-backdrop"
              dialogClass="premium-dialog"
              headerClass="premium-header"
              titleClass="premium-title"
              bodyClass="premium-body"
              messageClass="premium-message"
              countdownClass="premium-countdown"
              countdownTimeClass="premium-time"
              progressClass="premium-progress"
              progressBarClass="premium-progress-bar"
              actionsClass="premium-actions"
              primaryButtonClass="premium-btn premium-btn-primary"
              secondaryButtonClass="premium-btn premium-btn-secondary"
              [onExtendCallback]="handleExtend"
              [onLogoutCallback]="handleLogout"
              (sessionExtended)="logEvent('Session extended with custom styled dialog')">
            </idle-warning-dialog>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    h1 {
      color: #1e293b;
      margin-bottom: 5px;
      font-size: 2.5rem;
      text-align: center;
    }
    
    .subtitle {
      color: #64748b;
      margin-bottom: 40px;
      font-size: 18px;
      text-align: center;
    }
    
    /* Tab Navigation */
    .tabs {
      display: flex;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 30px;
      gap: 0;
    }
    
    .tab-btn {
      padding: 12px 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }
    
    .tab-btn:hover {
      background: #f8fafc;
      color: #3b82f6;
    }
    
    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
      background: #f8fafc;
    }
    
    .tab-content {
      min-height: 400px;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 40px 0;
    }
    
    .feature-item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s;
    }
    
    .feature-item:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .feature-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .feature-description {
      font-size: 14px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .demo-controls {
      display: flex;
      gap: 15px;
      margin: 30px 0;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: #64748b;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #475569;
      transform: translateY(-1px);
    }
    
    .industry-notice {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    
    .industry-notice h3 {
      color: #059669;
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    
    .industry-notice p {
      color: #047857;
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .event-log {
      margin: 30px 0;
    }
    
    .event-log h3 {
      margin-bottom: 15px;
      color: #1e293b;
    }
    
    .log-content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .event-item {
      display: flex;
      gap: 15px;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .event-item:last-child {
      border-bottom: none;
    }
    
    .event-time {
      color: #64748b;
      font-size: 12px;
      font-family: monospace;
      min-width: 70px;
    }
    
    .event-message {
      color: #1e293b;
      font-size: 14px;
    }
    
    .no-events {
      color: #64748b;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(2px);
    }
    
    .modal-dialog {
      background: white;
      border-radius: 12px;
      padding: 30px;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      animation: modalSlideIn 0.3s ease-out;
    }
    
    @keyframes modalSlideIn {
      from {
        transform: scale(0.95) translateY(-10px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #dc2626;
      margin: 0 0 20px 0;
    }
    
    .modal-body p {
      color: #374151;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .countdown-display {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border: 2px solid #f87171;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin: 15px 0;
    }
    
    .countdown-label {
      display: block;
      font-size: 13px;
      color: #991b1b;
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    .countdown-time {
      font-size: 28px;
      font-weight: 700;
      color: #dc2626;
      font-family: monospace;
    }
    
    .backdrop-explanation {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 12px;
      margin: 15px 0;
      font-size: 14px;
      color: #166534;
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 25px;
    }
    
    .modal-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .modal-btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .modal-btn-primary:hover {
      background: #2563eb;
    }
    
    .modal-btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .modal-btn-secondary:hover {
      background: #4b5563;
    }
    
    /* CSS Customization Tab Styles */
    .css-custom-section {
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .css-custom-section h2 {
      color: #1e293b;
      margin-bottom: 15px;
    }
    
    .customization-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #e2e8f0;
    }
    
    .customization-info h3 {
      color: #475569;
      margin-bottom: 15px;
    }
    
    .customization-info ul {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 10px;
    }
    
    .customization-info li {
      padding: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .customization-info code {
      color: #7c3aed;
      font-weight: 600;
    }
    
    /* Premium Custom Dialog Styles */
    :host ::ng-deep .premium-backdrop {
      background: radial-gradient(circle at center, rgba(124, 58, 237, 0.95), rgba(79, 70, 229, 0.95)) !important;
      backdrop-filter: blur(12px);
    }
    
    :host ::ng-deep .premium-dialog {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
      max-width: 480px;
      animation: premiumEntry 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes premiumEntry {
      from { transform: scale(0.7) rotateY(20deg); opacity: 0; }
      to { transform: scale(1) rotateY(0); opacity: 1; }
    }
    
    :host ::ng-deep .premium-header {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      padding: 25px;
      text-align: center;
    }
    
    :host ::ng-deep .premium-title {
      color: white;
      font-size: 26px;
      font-weight: 700;
      margin: 0;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    :host ::ng-deep .premium-body {
      padding: 30px;
      background: linear-gradient(to bottom, #fafaf9, #f5f5f4);
    }
    
    :host ::ng-deep .premium-message {
      color: #374151;
      font-size: 16px;
      line-height: 1.7;
      text-align: center;
      margin-bottom: 25px;
    }
    
    :host ::ng-deep .premium-countdown {
      background: linear-gradient(135deg, #fef3c7, #fed7aa);
      border: 3px solid #f59e0b;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    
    :host ::ng-deep .premium-time {
      font-size: 36px;
      font-weight: 900;
      background: linear-gradient(135deg, #dc2626, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-variant-numeric: tabular-nums;
    }
    
    :host ::ng-deep .premium-progress {
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      margin: 25px 0;
    }
    
    :host ::ng-deep .premium-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 1s linear;
    }
    
    :host ::ng-deep .premium-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      padding: 25px;
      background: white;
      border-top: 1px solid #e5e7eb;
    }
    
    :host ::ng-deep .premium-btn {
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    :host ::ng-deep .premium-btn-primary {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white;
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
    }
    
    :host ::ng-deep .premium-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5);
    }
    
    :host ::ng-deep .premium-btn-secondary {
      background: white;
      color: #7c3aed;
      border: 2px solid #7c3aed;
    }
    
    :host ::ng-deep .premium-btn-secondary:hover {
      background: #7c3aed;
      color: white;
    }
  `]
})
export class AppComponent {
  eventLog: Array<{ timestamp: string; message: string }> = [];
  activeTab = 'basic';
  
  constructor() {
    this.logEvent('Angular app initialized with complete idle detection solution');
    this.logEvent('Idle timeout: 2 minutes, Warning timeout: 20 seconds');
    this.logEvent('Multi-tab coordination: ENABLED - test with multiple browser tabs');
    
    // Monitor localStorage for debugging
    setInterval(() => {
      const idleExpiry = localStorage.getItem('idle-expiry-demo-idle-channel');
      if (idleExpiry) {
        console.log('[LocalStorage] idle-expiry-demo-idle-channel:', idleExpiry);
      }
    }, 5000);
  }
  
  // Idle detection event handlers
  onActivityDetected(event: Event) {
    this.logEvent(`Activity detected: ${event.type}`);
  }
  
  onIdleStart() {
    this.logEvent('User became idle');
  }
  
  onIdleEnd() {
    this.logEvent('User became active again');
  }
  
  onWarningStart() {
    this.logEvent('Warning dialog shown');
  }
  
  onWarningEnd() {
    this.logEvent('Warning dialog closed');
  }
  
  onSessionExtended() {
    this.logEvent('Session extended by user');
  }
  
  onSessionTimeout() {
    this.logEvent('Session timed out automatically');
  }
  
  // Callback functions for the idle warning dialog
  handleExtend = () => {
    this.logEvent('Session extended via "Yes, Continue" button');
  };
  
  handleLogout = () => {
    this.logEvent('User logged out via "No, Logout" button');
    alert('Session ended by user choice. Refresh the page to start a new session.');
  };
  
  clearLog() {
    this.eventLog = [];
    this.logEvent('Event log cleared');
  }
  
  logEvent(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLog.unshift({ timestamp, message });
    if (this.eventLog.length > 20) {
      this.eventLog.pop();
    }
  }
}