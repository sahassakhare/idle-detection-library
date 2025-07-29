import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="container">
      <h1>Angular Idle Detection Demo</h1>
      <p>Testing basic functionality - wait 10 seconds for idle warning</p>
      
      <div class="status">
        <p><strong>Status:</strong> {{ status }}</p>
        <p><strong>Last Activity:</strong> {{ lastActivity }}</p>
      </div>
      
      <button (click)="testActivity()">Test Activity</button>
      
      <!-- Simple idle warning dialog -->
      <idle-warning-dialog
        [idleTimeout]="10000"
        [warningTimeout]="5000"
        [enableMultiTab]="false"
        [onLogoutCallback]="handleLogout"
        [onExtendCallback]="handleExtend"
        dialogTitle="Session Timeout Test"
        dialogMessage="This is a test of the idle detection system."
        (activityDetected)="onActivity($event)">
      </idle-warning-dialog>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .status {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }
    
    button:hover {
      background: #0056b3;
    }
  `]
})
export class AppComponent {
  status = 'Active';
  lastActivity = new Date().toLocaleTimeString();
  
  constructor() {
    console.log('Simple Angular app initialized');
  }
  
  onActivity(event: Event) {
    this.lastActivity = new Date().toLocaleTimeString();
    this.status = 'Active';
    console.log('Activity detected:', event.type);
  }
  
  testActivity() {
    this.lastActivity = new Date().toLocaleTimeString();
    this.status = 'Button clicked';
    console.log('Test button clicked');
  }
  
  handleExtend = () => {
    this.status = 'Session extended';
    console.log('Session extended');
  };
  
  handleLogout = () => {
    this.status = 'Session ended';
    console.log('Session ended');
    alert('Session timeout - logging out');
  };
}