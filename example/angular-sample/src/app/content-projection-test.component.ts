import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-content-projection-test',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="test-container">
      <h2>Content Projection Test</h2>
      <p>Testing if custom templates work via content projection (ng-template inside component)</p>
      
      <div class="test-status">
        <p><strong>Status:</strong> {{ status }}</p>
        <p><strong>Template Used:</strong> {{ templateUsed }}</p>
      </div>
      
      <button (click)="triggerIdle()" class="test-btn">
        Trigger Idle Warning (for testing)
      </button>
      
      <!-- Testing content projection -->
      <idle-warning-dialog
        [idleTimeout]="5000"
        [warningTimeout]="10000"
        [enableMultiTab]="false"
        [onExtendCallback]="handleExtend"
        [onLogoutCallback]="handleLogout"
        (warningStart)="onWarningStart()"
        (warningEnd)="onWarningEnd()">
        
        <!-- Custom template via content projection -->
        <ng-template #customTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
          <div class="custom-modal">
            <div class="custom-header">
              <h3>🚨 Custom Template Working!</h3>
            </div>
            <div class="custom-body">
              <p>This template is projected from the parent component.</p>
              <div class="time-display">
                <strong>Time Remaining: {{ data.formattedTime }}</strong>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" [style.width.%]="data.progressPercentage"></div>
              </div>
            </div>
            <div class="custom-actions">
              <button class="btn btn-success" (click)="onExtend()">
                ✅ Continue Working
              </button>
              <button class="btn btn-danger" (click)="onLogout()">
                🚪 End Session
              </button>
            </div>
          </div>
        </ng-template>
        
      </idle-warning-dialog>
      
      <div class="instructions">
        <h3>How to Test:</h3>
        <ol>
          <li>Click "Trigger Idle Warning" or wait 5 seconds</li>
          <li>If content projection works, you'll see a custom styled dialog</li>
          <li>If it doesn't work, you'll see the default dialog</li>
          <li>Check the "Template Used" status above</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .test-status {
      background: #f0f9ff;
      border: 2px solid #0284c7;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    
    .test-status p {
      margin: 5px 0;
      color: #0c4a6e;
    }
    
    .test-btn {
      background: #dc2626;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      margin: 20px 0;
    }
    
    .test-btn:hover {
      background: #b91c1c;
    }
    
    .instructions {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .instructions h3 {
      margin: 0 0 10px 0;
      color: #1e293b;
    }
    
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .instructions li {
      margin: 5px 0;
      color: #475569;
    }
    
    /* Custom Modal Styles */
    .custom-modal {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      width: 400px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      animation: customPulse 0.5s ease-out;
    }
    
    @keyframes customPulse {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .custom-header {
      padding: 20px;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .custom-header h3 {
      margin: 0;
      font-size: 20px;
    }
    
    .custom-body {
      padding: 20px;
      text-align: center;
    }
    
    .time-display {
      background: rgba(255, 255, 255, 0.2);
      padding: 10px;
      border-radius: 8px;
      margin: 15px 0;
      font-size: 18px;
    }
    
    .progress-bar-container {
      background: rgba(255, 255, 255, 0.2);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 15px 0;
    }
    
    .progress-bar {
      background: #10b981;
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 4px;
    }
    
    .custom-actions {
      padding: 20px;
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .btn {
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-success {
      background: #10b981;
      color: white;
    }
    
    .btn-success:hover {
      background: #059669;
      transform: translateY(-1px);
    }
    
    .btn-danger {
      background: #ef4444;
      color: white;
    }
    
    .btn-danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }
  `]
})
export class ContentProjectionTestComponent {
  status = 'Ready for testing';
  templateUsed = 'Not determined yet';
  
  triggerIdle() {
    this.status = 'Idle triggered manually - watch for dialog';
    // This would need to be implemented with access to the component
    console.log('Manual idle trigger requested');
  }
  
  onWarningStart() {
    this.status = 'Warning dialog shown';
    this.templateUsed = 'Checking...';
    
    // Check if custom template is being used by looking for the custom elements
    setTimeout(() => {
      const customModal = document.querySelector('.custom-modal');
      if (customModal) {
        this.templateUsed = '✅ Custom template (content projection working!)';
      } else {
        this.templateUsed = '❌ Default template (content projection not working)';
      }
    }, 100);
  }
  
  onWarningEnd() {
    this.status = 'Warning dialog closed';
  }
  
  handleExtend = () => {
    this.status = 'Session extended via custom template';
    console.log('Extend called from custom template');
  };
  
  handleLogout = () => {
    this.status = 'Logout called via custom template';
    console.log('Logout called from custom template');
  };
}