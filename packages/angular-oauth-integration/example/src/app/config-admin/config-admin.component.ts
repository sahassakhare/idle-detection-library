import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdleConfigService } from '../services/config.service';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-config-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="config-admin">
      <div class="admin-header">
        <h2>🛠️ Idle Detection Configuration</h2>
        <p>Configure timeout settings and test different scenarios</p>
      </div>

      <!-- Current Status -->
      <div class="status-section card">
        <h3>📊 Current Status</h3>
        <div class="status-grid">
          <div class="status-item">
            <label>Environment:</label>
            <span class="badge" [class]="'badge-' + environment()">{{ environment() }}</span>
          </div>
          <div class="status-item">
            <label>Idle Timeout:</label>
            <span>{{ formatDuration(currentConfig()?.idleTimeout || 0) }}</span>
          </div>
          <div class="status-item">
            <label>Warning Timeout:</label>
            <span>{{ formatDuration(currentConfig()?.warningTimeout || 0) }}</span>
          </div>
          <div class="status-item">
            <label>Session State:</label>
            <span class="badge" [class]="getSessionStateClass()">{{ getSessionStateText() }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="presets-section card">
        <h3>⚡ Quick Presets</h3>
        <div class="presets-grid">
          <div 
            *ngFor="let preset of presetsArray" 
            class="preset-card"
            [class.active]="isCurrentPreset(preset.key)">
            <div class="preset-header">
              <h4>{{ preset.key | titlecase }}</h4>
              <p>{{ preset.value.description }}</p>
            </div>
            <div class="preset-details">
              <div>Idle: {{ formatDuration(preset.value.idleTimeout) }}</div>
              <div>Warning: {{ formatDuration(preset.value.warningTimeout) }}</div>
            </div>
            <button 
              class="btn btn-preset" 
              (click)="applyPreset(preset.key)"
              [disabled]="isCurrentPreset(preset.key)">
              {{ isCurrentPreset(preset.key) ? 'Current' : 'Apply' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Configuration -->
      <div class="custom-section card">
        <h3>🎛️ Custom Configuration</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="idleMinutes">Idle Timeout (minutes):</label>
            <input 
              type="number" 
              id="idleMinutes"
              [(ngModel)]="customIdleMinutes"
              min="1" 
              max="120"
              class="form-control">
            <small>Time before user is considered idle</small>
          </div>
          
          <div class="form-group">
            <label for="warningSeconds">Warning Timeout (seconds):</label>
            <input 
              type="number" 
              id="warningSeconds"
              [(ngModel)]="customWarningSeconds"
              min="10" 
              max="600"
              class="form-control">
            <small>Warning phase duration before timeout</small>
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="customAutoRefresh"
                class="form-checkbox">
              Auto-refresh tokens on activity
            </label>
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="customMultiTab"
                class="form-checkbox">
              Enable multi-tab coordination
            </label>
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="customDebug"
                class="form-checkbox">
              Enable debug logging
            </label>
          </div>
        </div>

        <div class="custom-actions">
          <button class="btn btn-apply" (click)="applyCustomConfig()">
            🔄 Apply Custom Configuration
          </button>
          <button class="btn btn-reset" (click)="resetToDefaults()">
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      <!-- Dialog Configuration -->
      <div class="dialog-section card">
        <h3>💬 Dialog Configuration</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="dialogTitle">Dialog Title:</label>
            <input 
              type="text" 
              id="dialogTitle"
              [(ngModel)]="dialogTitle"
              class="form-control"
              placeholder="Session Timeout Warning">
          </div>
          
          <div class="form-group">
            <label for="dialogMessage">Dialog Message:</label>
            <textarea 
              id="dialogMessage"
              [(ngModel)]="dialogMessage"
              class="form-control"
              rows="3"
              placeholder="Your session will expire soon..."></textarea>
          </div>

          <div class="form-group">
            <label for="dialogTheme">Theme:</label>
            <select id="dialogTheme" [(ngModel)]="dialogTheme" class="form-control">
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dialogSize">Size:</label>
            <select id="dialogSize" [(ngModel)]="dialogSize" class="form-control">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Testing Section -->
      <div class="testing-section card">
        <h3>🧪 Testing & Actions</h3>
        
        <div class="test-actions">
          <button class="btn btn-test" (click)="simulateIdleState()">
            💤 Simulate Idle State
          </button>
          <button class="btn btn-test" (click)="simulateWarningState()">
            ⚠️ Show Warning Dialog
          </button>
          <button class="btn btn-test" (click)="resetIdleTimer()">
            🔄 Reset Idle Timer
          </button>
          <button class="btn btn-test" (click)="showCurrentStatus()">
            📊 Show Current Status
          </button>
        </div>

        <div class="persistence-actions">
          <button class="btn btn-save" (click)="saveConfiguration()">
            💾 Save Configuration
          </button>
          <button class="btn btn-load" (click)="loadSavedConfiguration()">
            📂 Load Saved Configuration
          </button>
        </div>
      </div>

      <!-- Configuration Preview -->
      <div class="preview-section card">
        <h3>📋 Configuration Preview</h3>
        <pre class="config-preview">{{ getConfigPreview() }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .config-admin {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .admin-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .admin-header h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .admin-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }

    .card h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.2rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .status-item label {
      font-weight: 500;
      color: #495057;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-development {
      background: #e3f2fd;
      color: #1565c0;
    }

    .badge-staging {
      background: #fff3e0;
      color: #ef6c00;
    }

    .badge-production {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .badge-active {
      background: #d4edda;
      color: #155724;
    }

    .badge-idle {
      background: #fff3cd;
      color: #856404;
    }

    .badge-warning {
      background: #f8d7da;
      color: #721c24;
    }

    .presets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .preset-card {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .preset-card:hover {
      border-color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    }

    .preset-card.active {
      border-color: #28a745;
      background: #f8fff8;
    }

    .preset-header h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .preset-header p {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .preset-details {
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #495057;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-checkbox {
      width: auto;
      margin-right: 0.5rem;
    }

    .form-group small {
      margin-top: 0.25rem;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .custom-actions,
    .test-actions,
    .persistence-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-preset {
      background: #007bff;
      color: white;
    }

    .btn-preset:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-preset:disabled {
      background: #28a745;
      cursor: not-allowed;
    }

    .btn-apply {
      background: #28a745;
      color: white;
    }

    .btn-apply:hover {
      background: #218838;
    }

    .btn-reset {
      background: #6c757d;
      color: white;
    }

    .btn-reset:hover {
      background: #545b62;
    }

    .btn-test {
      background: #17a2b8;
      color: white;
    }

    .btn-test:hover {
      background: #138496;
    }

    .btn-save {
      background: #ffc107;
      color: #212529;
    }

    .btn-save:hover {
      background: #e0a800;
    }

    .btn-load {
      background: #fd7e14;
      color: white;
    }

    .btn-load:hover {
      background: #e96500;
    }

    .config-preview {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 1rem;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    @media (max-width: 768px) {
      .status-grid,
      .presets-grid,
      .form-grid {
        grid-template-columns: 1fr;
      }

      .custom-actions,
      .test-actions,
      .persistence-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ConfigAdminComponent implements OnInit {
  private configService = inject(IdleConfigService);
  private idleService = inject(IdleOAuthService);

  // Current configuration state
  currentConfig = signal(this.configService.getConfig());
  environment = signal('development');

  // Form data
  customIdleMinutes = 15;
  customWarningSeconds = 120;
  customAutoRefresh = true;
  customMultiTab = true;
  customDebug = false;

  // Dialog configuration
  dialogTitle = '';
  dialogMessage = '';
  dialogTheme = 'default';
  dialogSize = 'medium';

  // Computed values
  presetsArray = computed(() => {
    const presets = this.configService.getTimeoutPresets();
    return Object.entries(presets).map(([key, value]) => ({ key, value }));
  });

  ngOnInit(): void {
    // Subscribe to configuration changes
    this.configService.config$.subscribe(config => {
      this.currentConfig.set(config);
      if (config) {
        this.updateFormFromConfig(config);
      }
    });

    // Determine environment
    this.environment.set(this.getEnvironmentName());
  }

  private updateFormFromConfig(config: any): void {
    this.customIdleMinutes = Math.floor(config.idleTimeout / (60 * 1000));
    this.customWarningSeconds = Math.floor(config.warningTimeout / 1000);
    this.customAutoRefresh = config.autoRefreshToken || false;
    this.customMultiTab = config.enableMultiTabCoordination || false;
    this.customDebug = config.debug || false;

    // Update dialog config
    if (config.warningDialogConfig) {
      this.dialogTitle = config.warningDialogConfig.title || '';
      this.dialogMessage = config.warningDialogConfig.message || '';
      this.dialogTheme = config.warningDialogConfig.theme || 'default';
      this.dialogSize = config.warningDialogConfig.size || 'medium';
    }
  }

  applyPreset(presetName: string): void {
    this.configService.applyTimeoutPreset(presetName as any);
  }

  applyCustomConfig(): void {
    this.configService.updateConfig({
      idleTimeout: this.customIdleMinutes * 60 * 1000,
      warningTimeout: this.customWarningSeconds * 1000,
      autoRefreshToken: this.customAutoRefresh,
      enableMultiTabCoordination: this.customMultiTab,
      debug: this.customDebug,
      warningDialogConfig: {
        title: this.dialogTitle,
        message: this.dialogMessage,
        theme: this.dialogTheme as any,
        size: this.dialogSize as any
      }
    });
  }

  resetToDefaults(): void {
    this.configService.resetToDefaults();
  }

  isCurrentPreset(presetName: string): boolean {
    const presets = this.configService.getTimeoutPresets();
    const preset = presets[presetName as keyof typeof presets];
    const current = this.currentConfig();
    
    if (!preset || !current) return false;
    
    return preset.idleTimeout === current.idleTimeout && 
           preset.warningTimeout === current.warningTimeout;
  }

  simulateIdleState(): void {
    console.log('🧪 Simulating idle state...');
    // This would need additional service methods
  }

  simulateWarningState(): void {
    console.log('🧪 Simulating warning state...');
    // This would trigger the warning dialog
  }

  resetIdleTimer(): void {
    this.idleService.resetIdle();
    console.log('🔄 Idle timer reset');
  }

  showCurrentStatus(): void {
    const status = this.idleService.getCurrentState();
    console.log('📊 Current Status:', status);
    alert(`Current Status:\nState: ${this.getSessionStateText()}\nLast Activity: ${status.lastActivity.toLocaleTimeString()}`);
  }

  saveConfiguration(): void {
    this.configService.saveConfigToLocalStorage();
    alert('💾 Configuration saved to localStorage');
  }

  loadSavedConfiguration(): void {
    const saved = this.configService.loadConfigFromLocalStorage();
    if (saved) {
      this.configService.updateConfig(saved);
      alert('📂 Configuration loaded from localStorage');
    } else {
      alert('❌ No saved configuration found');
    }
  }

  getSessionStateText(): string {
    const state = this.idleService.getCurrentState();
    if (state.isTimedOut) return 'Timed Out';
    if (state.isWarning) return 'Warning';
    if (state.isIdle) return 'Idle';
    return 'Active';
  }

  getSessionStateClass(): string {
    const state = this.idleService.getCurrentState();
    if (state.isTimedOut) return 'badge-warning';
    if (state.isWarning) return 'badge-warning';
    if (state.isIdle) return 'badge-idle';
    return 'badge-active';
  }

  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  private getEnvironmentName(): string {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '4200') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev.')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  getConfigPreview(): string {
    const config = this.currentConfig();
    if (!config) return 'No configuration loaded';

    return JSON.stringify({
      environment: this.environment(),
      idleTimeout: `${Math.floor(config.idleTimeout / (60 * 1000))} minutes`,
      warningTimeout: `${Math.floor(config.warningTimeout / 1000)} seconds`,
      autoRefreshToken: config.autoRefreshToken,
      enableMultiTabCoordination: config.enableMultiTabCoordination,
      debug: config.debug,
      warningDialogConfig: config.warningDialogConfig
    }, null, 2);
  }
}