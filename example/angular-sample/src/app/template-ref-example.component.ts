import { Component, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-template-ref-example',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="example-container">
      <h2>Template Reference Example</h2>
      <p>This example shows how to pass a template reference to the idle warning dialog.</p>
      
      <!-- Define template separately -->
      <ng-template #minimalTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
        <div class="minimal-dialog">
          <div class="minimal-content">
            <h3>⏰ Time's Running Out!</h3>
            <div class="countdown">{{ data.formattedTime }}</div>
            <div class="button-group">
              <button class="minimal-btn extend" (click)="onExtend()">Continue</button>
              <button class="minimal-btn logout" (click)="onLogout()">Exit</button>
            </div>
          </div>
        </div>
      </ng-template>
      
      <!-- Use idle-warning-dialog with template reference -->
      <idle-warning-dialog
        [customTemplateRef]="minimalTemplate"
        [idleTimeout]="20000"
        [warningTimeout]="10000"
        [enableMultiTab]="false"
        [onExtendCallback]="onExtend"
        [onLogoutCallback]="onLogout">
      </idle-warning-dialog>
      
      <div class="info-box">
        <h3>Template Context Variables</h3>
        <p>The custom template receives these context variables:</p>
        <ul>
          <li><code>data.$implicit</code> - Object containing all dialog data</li>
          <li><code>data.timeRemaining</code> - Milliseconds remaining</li>
          <li><code>data.formattedTime</code> - Formatted time string (MM:SS)</li>
          <li><code>data.progressPercentage</code> - Progress percentage (0-100)</li>
          <li><code>data.dialogTitle</code> - Dialog title</li>
          <li><code>data.dialogMessage</code> - Dialog message</li>
          <li><code>onExtend</code> - Function to call when extending session</li>
          <li><code>onLogout</code> - Function to call when logging out</li>
          <li><code>theme</code> - Current theme</li>
          <li><code>size</code> - Current size</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .minimal-dialog {
      background: #1a1a1a;
      color: #ffffff;
      border-radius: 12px;
      padding: 30px;
      max-width: 300px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .minimal-content h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }
    
    .countdown {
      font-size: 48px;
      font-weight: 700;
      color: #ff6b6b;
      margin: 20px 0;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    }
    
    .minimal-btn {
      padding: 10px 20px;
      border: 2px solid transparent;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .minimal-btn.extend {
      background: #4ade80;
      color: #1a1a1a;
      border-color: #4ade80;
    }
    
    .minimal-btn.extend:hover {
      background: transparent;
      color: #4ade80;
    }
    
    .minimal-btn.logout {
      background: transparent;
      color: #ff6b6b;
      border-color: #ff6b6b;
    }
    
    .minimal-btn.logout:hover {
      background: #ff6b6b;
      color: #1a1a1a;
    }
    
    .info-box {
      margin-top: 40px;
      padding: 20px;
      background: #f0f9ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
    }
    
    .info-box h3 {
      margin: 0 0 15px 0;
      color: #1e40af;
    }
    
    .info-box ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .info-box li {
      margin: 8px 0;
      color: #1e293b;
    }
    
    .info-box code {
      background: #e0e7ff;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
      color: #4338ca;
    }
  `]
})
export class TemplateRefExampleComponent implements AfterViewInit {
  @ViewChild('minimalTemplate', { static: true }) minimalTemplate!: TemplateRef<any>;
  
  ngAfterViewInit() {
    console.log('Template reference example loaded');
  }
  
  onExtend = () => {
    console.log('Session extended via minimal template');
  };
  
  onLogout = () => {
    console.log('Logout triggered via minimal template');
    alert('Logging out...');
  };
}