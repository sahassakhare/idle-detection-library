# Enhanced Idle Warning Dialog: Complete Implementation Guide

## Overview

The Enhanced Idle Warning Dialog provides a security-first, highly customizable solution for session timeout management with industry-standard compliance and advanced user experience features.

## Quick Start

### Basic Implementation

```typescript
import { Component } from '@angular/core';
import { EnhancedIdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';
import { CONFIGURATION_EXAMPLES } from '@idle-detection/angular-oauth-integration/examples';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EnhancedIdleWarningDialogComponent],
  template: `
    <div class="app-content">
      <!-- Your application content -->
    </div>
    
    <!-- Enhanced idle detection with industry-specific configuration -->
    <enhanced-idle-warning-dialog
      [config]="idleConfig"
      (actionExecuted)="onActionExecuted($event)"
      (securityEvent)="onSecurityEvent($event)"
      (auditLog)="onAuditLog($event)">
    </enhanced-idle-warning-dialog>
  `
})
export class AppComponent {
  // Use pre-configured industry template
  idleConfig = CONFIGURATION_EXAMPLES.ENTERPRISE_CONFIG;

  onActionExecuted(event: any) {
    console.log('Action executed:', event);
  }

  onSecurityEvent(event: any) {
    console.log('Security event:', event);
    // Send to security monitoring system
  }

  onAuditLog(entry: any) {
    console.log('Audit log entry:', entry);
    // Send to compliance logging system
  }
}
```

## Industry-Specific Configurations

### Banking/Financial Services

```typescript
import { BANKING_CONFIG } from '@idle-detection/angular-oauth-integration/examples';

@Component({
  template: `
    <enhanced-idle-warning-dialog
      [config]="bankingConfig"
      (auditLog)="sendToComplianceSystem($event)">
    </enhanced-idle-warning-dialog>
  `
})
export class BankingAppComponent {
  bankingConfig = {
    ...BANKING_CONFIG,
    // Override specific settings
    warningTimeout: 180000, // 3 minutes for high-security environment
    
    // Custom banking-specific actions
    customActions: [
      {
        id: 'verify-identity',
        label: 'Verify Identity',
        icon: '🔐',
        variant: 'primary',
        position: 'center',
        order: 0,
        requiresConfirmation: true,
        confirmationConfig: {
          id: 'identity-verification',
          title: 'Identity Verification Required',
          message: 'Please verify your identity to continue banking session.',
          confirmText: 'Verify Identity',
          cancelText: 'Cancel',
          type: 'warning',
          requiresInput: true,
          expectedInput: 'VERIFY'
        },
        securityValidation: async (context) => {
          // Implement identity verification
          return this.verifyUserIdentity(context);
        },
        action: async (context) => {
          const verified = await this.performIdentityCheck(context);
          return {
            success: verified,
            shouldExtendSession: verified,
            message: verified ? 'Identity verified successfully' : 'Identity verification failed'
          };
        },
        auditLog: true
      }
    ]
  };

  async verifyUserIdentity(context: any): Promise<boolean> {
    // Implement identity verification logic
    return true;
  }

  async performIdentityCheck(context: any): Promise<boolean> {
    // Implement identity check
    return true;
  }

  sendToComplianceSystem(entry: any) {
    // Send audit entries to compliance system
    console.log('Compliance log:', entry);
  }
}
```

### Healthcare/HIPAA Compliance

```typescript
import { HEALTHCARE_CONFIG } from '@idle-detection/angular-oauth-integration/examples';

@Component({
  template: `
    <enhanced-idle-warning-dialog
      [config]="hipaaConfig"
      (securityEvent)="handleSecurityEvent($event)">
    </enhanced-idle-warning-dialog>
  `
})
export class HealthcareAppComponent {
  hipaaConfig = {
    ...HEALTHCARE_CONFIG,
    
    // HIPAA-specific customizations
    template: {
      templateVariables: {
        title: 'Patient Data Access Timeout',
        message: 'Your access to patient records will expire soon.',
        secondaryMessage: 'This timeout ensures HIPAA compliance and protects patient privacy.'
      },
      securityValidation: true,
      preserveAccessibility: true
    },

    // Custom healthcare actions
    customActions: [
      {
        id: 'emergency-override',
        label: 'Emergency Override',
        icon: '🚨',
        variant: 'danger',
        position: 'left',
        order: 0,
        visible: (context) => context.userRole === 'emergency_physician',
        requiresConfirmation: true,
        confirmationConfig: {
          id: 'emergency-confirmation',
          title: 'Emergency Override',
          message: 'This action will be logged for HIPAA audit. Confirm this is a medical emergency.',
          confirmText: 'Confirm Emergency',
          cancelText: 'Cancel',
          type: 'danger',
          requiresInput: true,
          expectedInput: 'EMERGENCY'
        },
        action: async (context) => {
          // Log emergency override
          await this.logEmergencyOverride(context);
          return {
            success: true,
            shouldExtendSession: true,
            message: 'Emergency override granted - logged for HIPAA compliance'
          };
        },
        auditLog: true
      },
      {
        id: 'secure-patient-data',
        label: 'Secure Patient Data',
        icon: '🔒',
        variant: 'primary',
        position: 'center',
        order: 1,
        action: async (context) => {
          // Secure patient data before timeout
          await this.securePatientData(context);
          return {
            success: true,
            shouldExtendSession: true,
            message: 'Patient data secured and session extended'
          };
        },
        auditLog: true
      }
    ]
  };

  async logEmergencyOverride(context: any) {
    // Log emergency override for HIPAA compliance
    console.log('Emergency override logged:', context);
  }

  async securePatientData(context: any) {
    // Implement patient data securing
    console.log('Patient data secured:', context);
  }

  handleSecurityEvent(event: any) {
    // Handle HIPAA security events
    console.log('HIPAA security event:', event);
  }
}
```

## Advanced Customization

### Custom HTML Template

```typescript
@Component({
  template: `
    <enhanced-idle-warning-dialog [config]="customTemplateConfig">
    </enhanced-idle-warning-dialog>
  `
})
export class CustomTemplateComponent {
  customTemplateConfig: EnhancedIdleDialogConfig = {
    idleTimeout: 900000,
    warningTimeout: 300000,
    
    template: {
      htmlTemplate: `
        <div class="brand-dialog">
          <!-- Custom Header -->
          <div class="brand-header">
            <img src="/assets/logo.svg" alt="Company Logo" class="brand-logo">
            <h1 class="brand-title">{{title}}</h1>
            <div class="security-badge">
              <span class="security-icon">🛡️</span>
              <span>{{securityLevel}}</span>
            </div>
          </div>

          <!-- Visual Timeline -->
          <div class="timeline-container">
            <div class="timeline-track">
              <div class="timeline-progress" style="width: {{progressPercentage}}%"></div>
              <div class="timeline-markers">
                <div class="marker" data-stage="safe">✅</div>
                <div class="marker" data-stage="warning">⚠️</div>
                <div class="marker" data-stage="critical">🚨</div>
              </div>
            </div>
            <div class="timeline-labels">
              <span>Safe</span>
              <span>Warning</span>
              <span>Critical</span>
            </div>
          </div>

          <!-- Dynamic Message Area -->
          <div class="message-area" data-urgency="{{urgencyLevel}}">
            <div class="message-icon">{{stageIcon}}</div>
            <div class="message-content">
              <p class="primary-message">{{message}}</p>
              <p class="time-remaining">{{formattedTime}} remaining</p>
            </div>
          </div>

          <!-- Smart Actions -->
          <div class="smart-actions">
            <button class="action-btn save-continue" data-action="save-continue">
              <span class="btn-icon">💾</span>
              <span class="btn-text">Save & Continue</span>
              <span class="btn-shortcut">Ctrl+S</span>
            </button>
            <button class="action-btn extend-session" data-action="extend">
              <span class="btn-icon">⏰</span>
              <span class="btn-text">Extend Session</span>
              <span class="btn-shortcut">Enter</span>
            </button>
            <button class="action-btn secure-logout" data-action="logout">
              <span class="btn-icon">🚪</span>
              <span class="btn-text">Secure Logout</span>
              <span class="btn-shortcut">Ctrl+L</span>
            </button>
          </div>

          <!-- Footer Information -->
          <div class="dialog-footer">
            <div class="security-info">
              <small>🔒 Secured by {{securityProfile}} standards</small>
            </div>
            <div class="help-text">
              <small>Need help? Press F1 for session management guide</small>
            </div>
          </div>
        </div>
      `,
      templateVariables: {
        title: 'Workspace Session',
        securityLevel: 'Enterprise',
        securityProfile: 'Enterprise Security'
      },
      customStyles: {
        'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'color': 'white',
        'border-radius': '24px',
        'padding': '40px'
      },
      securityValidation: true,
      preserveAccessibility: true
    },

    customActions: [
      {
        id: 'save-continue',
        label: 'Save & Continue',
        icon: '💾',
        variant: 'primary',
        position: 'left',
        order: 0,
        action: async (context) => {
          // Auto-save functionality
          await this.autoSaveUserWork(context);
          return {
            success: true,
            shouldExtendSession: true,
            message: 'Work saved automatically'
          };
        }
      }
    ]
  };

  async autoSaveUserWork(context: any) {
    // Implement auto-save logic
    console.log('Auto-saving user work...', context);
  }
}
```

### Multi-Stage Warning System

```typescript
@Component({
  template: `
    <enhanced-idle-warning-dialog 
      [config]="multiStageConfig"
      (stageChanged)="onStageChanged($event)">
    </enhanced-idle-warning-dialog>
  `
})
export class MultiStageWarningComponent {
  multiStageConfig: EnhancedIdleDialogConfig = {
    idleTimeout: 1800000, // 30 minutes
    warningTimeout: 600000, // 10 minutes warning

    warningStages: [
      {
        id: 'gentle-notice',
        name: 'Gentle Reminder',
        triggerAtSeconds: 480, // 8 minutes remaining
        urgencyLevel: 'low',
        visualTreatment: {
          backgroundColor: '#f0f9ff',
          borderColor: '#3b82f6',
          borderWidth: '2px',
          animation: {
            type: 'fade',
            duration: 500,
            easing: 'ease-in'
          }
        },
        soundAlert: {
          enabled: true,
          soundFile: '/assets/sounds/gentle-chime.mp3',
          volume: 0.3,
          respectUserPreferences: true
        },
        customNotification: {
          type: 'toast',
          title: 'Session Check',
          message: 'Your session is still active',
          persistent: false
        }
      },
      {
        id: 'attention-needed',
        name: 'Attention Needed',
        triggerAtSeconds: 240, // 4 minutes remaining
        urgencyLevel: 'medium',
        visualTreatment: {
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b',
          borderWidth: '3px',
          animation: {
            type: 'bounce',
            duration: 800,
            easing: 'ease-out'
          }
        },
        soundAlert: {
          enabled: true,
          soundFile: '/assets/sounds/attention-bell.mp3',
          volume: 0.5,
          repeat: false
        },
        customNotification: {
          type: 'browser',
          title: 'Action Required',
          message: 'Your session needs attention in 4 minutes',
          icon: '/assets/icons/warning.png',
          persistent: true,
          actionable: true
        }
      },
      {
        id: 'urgent-action',
        name: 'Urgent Action Required',
        triggerAtSeconds: 120, // 2 minutes remaining
        urgencyLevel: 'high',
        visualTreatment: {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          borderWidth: '4px',
          textColor: '#7f1d1d',
          animation: {
            type: 'pulse',
            duration: 1000,
            easing: 'ease-in-out'
          }
        },
        soundAlert: {
          enabled: true,
          soundFile: '/assets/sounds/urgent-alarm.mp3',
          volume: 0.7,
          repeat: true
        },
        vibrationPattern: [200, 100, 200], // For mobile devices
        customNotification: {
          type: 'modal',
          title: 'URGENT: Session Expiring',
          message: 'Take action now to prevent logout',
          persistent: true,
          actionable: true
        }
      },
      {
        id: 'final-warning',
        name: 'Final Warning',
        triggerAtSeconds: 30, // 30 seconds remaining
        urgencyLevel: 'critical',
        visualTreatment: {
          backgroundColor: '#7f1d1d',
          borderColor: '#dc2626',
          borderWidth: '5px',
          textColor: '#ffffff',
          animation: {
            type: 'shake',
            duration: 500,
            easing: 'ease-in-out'
          }
        },
        soundAlert: {
          enabled: true,
          soundFile: '/assets/sounds/critical-alert.mp3',
          volume: 0.9,
          repeat: true
        },
        vibrationPattern: [300, 200, 300, 200, 300], // Intensive vibration
        customNotification: {
          type: 'modal',
          title: 'CRITICAL: Session Ending Now',
          message: 'Your session will end in 30 seconds',
          persistent: true,
          actionable: true
        },
        actions: ['emergency-extend'] // Only emergency extend available
      }
    ],

    customActions: [
      {
        id: 'standard-extend',
        label: 'Continue Session',
        icon: '⏰',
        variant: 'primary',
        position: 'center',
        order: 0,
        visible: (context) => {
          // Hide during critical stage
          return this.currentStage?.urgencyLevel !== 'critical';
        },
        action: async () => ({
          success: true,
          shouldExtendSession: true
        })
      },
      {
        id: 'emergency-extend',
        label: 'Emergency Extension',
        icon: '🚨',
        variant: 'danger',
        position: 'center',
        order: 0,
        visible: (context) => {
          // Only show during critical stage
          return this.currentStage?.urgencyLevel === 'critical';
        },
        requiresConfirmation: true,
        confirmationConfig: {
          id: 'emergency-confirm',
          title: 'Emergency Session Extension',
          message: 'This will grant an emergency 15-minute extension. Use only if necessary.',
          confirmText: 'Grant Emergency Extension',
          cancelText: 'Cancel',
          type: 'danger'
        },
        action: async (context) => {
          // Log emergency extension
          console.log('Emergency extension granted:', context);
          return {
            success: true,
            shouldExtendSession: true,
            message: 'Emergency 15-minute extension granted'
          };
        },
        auditLog: true
      }
    ]
  };

  currentStage: WarningStage | null = null;

  onStageChanged(stage: WarningStage) {
    this.currentStage = stage;
    console.log('Warning stage changed:', stage);
    
    // Handle stage-specific logic
    switch (stage.urgencyLevel) {
      case 'low':
        // Gentle reminder actions
        this.showToast('Session check - you\'re still active');
        break;
      case 'medium':
        // More prominent notification
        this.showBrowserNotification('Action required in 4 minutes');
        break;
      case 'high':
        // Urgent actions
        this.highlightUnsavedWork();
        this.disableNonEssentialFeatures();
        break;
      case 'critical':
        // Critical actions
        this.autoSaveAllWork();
        this.prepareForLogout();
        break;
    }
  }

  showToast(message: string) {
    // Implement toast notification
  }

  showBrowserNotification(message: string) {
    // Implement browser notification
  }

  highlightUnsavedWork() {
    // Highlight unsaved changes
  }

  disableNonEssentialFeatures() {
    // Disable non-critical UI elements
  }

  autoSaveAllWork() {
    // Automatically save all user work
  }

  prepareForLogout() {
    // Prepare application for logout
  }
}
```

### Advanced Security Configuration

```typescript
@Component({
  template: `
    <enhanced-idle-warning-dialog 
      [config]="maxSecurityConfig"
      (securityEvent)="handleSecurityViolation($event)">
    </enhanced-idle-warning-dialog>
  `
})
export class MaxSecurityComponent {
  maxSecurityConfig: EnhancedIdleDialogConfig = {
    idleTimeout: 600000, // 10 minutes
    warningTimeout: 120000, // 2 minutes

    securityProfile: {
      profile: SecurityProfile.BANKING,
      level: SecurityLevel.MAXIMUM,
      
      closeButton: {
        enabled: false, // No close button
        auditLog: true,
        roleRestrictions: ['security_admin']
      },
      
      backdropDismissible: false,
      escapeKeyDismissible: false,
      
      customizationRestrictions: [
        {
          property: 'template.htmlTemplate',
          reason: 'Maximum security profile prohibits custom HTML',
          validator: (value) => !value // No custom HTML allowed
        },
        {
          property: 'customActions',
          reason: 'Custom actions must be pre-approved',
          validator: (actions) => this.validateCustomActions(actions)
        }
      ],
      
      auditingRequired: true,
      encryptedStorage: true,
      complianceValidation: true
    },

    customActions: [
      {
        id: 'biometric-extend',
        label: 'Extend with Biometric',
        icon: '👆',
        variant: 'primary',
        position: 'center',
        order: 0,
        securityValidation: async (context) => {
          // Require biometric authentication
          return await this.performBiometricAuth(context);
        },
        action: async (context) => {
          const biometricResult = await this.verifyBiometric(context);
          if (biometricResult.success) {
            return {
              success: true,
              shouldExtendSession: true,
              message: 'Session extended with biometric verification'
            };
          } else {
            return {
              success: false,
              message: 'Biometric verification failed'
            };
          }
        },
        auditLog: true
      },
      {
        id: 'mfa-extend',
        label: 'Extend with MFA',
        icon: '🔐',
        variant: 'secondary',
        position: 'right',
        order: 1,
        requiresConfirmation: true,
        confirmationConfig: {
          id: 'mfa-challenge',
          title: 'Multi-Factor Authentication',
          message: 'Please complete MFA challenge to extend session.',
          confirmText: 'Complete MFA',
          cancelText: 'Cancel',
          type: 'warning',
          requiresInput: true,
          expectedInput: this.generateMFACode() // Dynamic MFA code
        },
        securityValidation: async (context) => {
          return await this.validateMFA(context);
        },
        action: async (context) => {
          return {
            success: true,
            shouldExtendSession: true,
            message: 'Session extended with MFA verification'
          };
        },
        auditLog: true
      }
    ],

    // Security event handlers
    onSecurityEvent: (event) => {
      this.logSecurityEvent(event);
      if (event.severity === 'critical') {
        this.triggerSecurityAlert(event);
      }
    },

    onAuditLog: (entry) => {
      this.sendToSecurityLog(entry);
      this.storeEncryptedAuditLog(entry);
    }
  };

  validateCustomActions(actions: any[]): boolean {
    // Validate that all actions are pre-approved
    const approvedActions = ['biometric-extend', 'mfa-extend'];
    return actions.every(action => approvedActions.includes(action.id));
  }

  async performBiometricAuth(context: any): Promise<boolean> {
    // Implement biometric authentication
    console.log('Performing biometric authentication...', context);
    return true; // Placeholder
  }

  async verifyBiometric(context: any): Promise<{ success: boolean }> {
    // Implement biometric verification
    console.log('Verifying biometric...', context);
    return { success: true }; // Placeholder
  }

  generateMFACode(): string {
    // Generate dynamic MFA code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async validateMFA(context: any): Promise<boolean> {
    // Validate MFA challenge
    console.log('Validating MFA...', context);
    return true; // Placeholder
  }

  handleSecurityViolation(event: any) {
    console.log('Security violation detected:', event);
    // Implement security incident response
  }

  logSecurityEvent(event: any) {
    // Log to security monitoring system
    console.log('Security event logged:', event);
  }

  triggerSecurityAlert(event: any) {
    // Trigger critical security alert
    console.log('Critical security alert triggered:', event);
  }

  sendToSecurityLog(entry: any) {
    // Send to centralized security logging
    console.log('Security log entry:', entry);
  }

  storeEncryptedAuditLog(entry: any) {
    // Store encrypted audit log
    console.log('Encrypted audit log stored:', entry);
  }
}
```

## Accessibility Implementation

```typescript
@Component({
  template: `
    <enhanced-idle-warning-dialog [config]="accessibilityConfig">
    </enhanced-idle-warning-dialog>
  `
})
export class AccessibilityOptimizedComponent {
  accessibilityConfig: EnhancedIdleDialogConfig = {
    idleTimeout: 1800000,
    warningTimeout: 300000,

    accessibility: {
      screenReaderOptimized: true,
      highContrastMode: true,
      
      announcements: {
        announceOpen: true,
        announceCountdown: true,
        announceStageChanges: true,
        customAnnouncements: {
          'dialog-opened': 'Session timeout warning dialog has opened. Use Tab to navigate, Enter to extend session, or Alt+L to logout.',
          'countdown-update': 'Time remaining: {{timeRemaining}}. Use keyboard shortcuts for quick action.',
          'stage-critical': 'Critical warning: Your session will end very soon. Take immediate action.',
          'session-extended': 'Success: Your session has been extended. You can continue working safely.',
          'action-processing': 'Please wait. Your request is being processed securely.'
        },
        politeAnnouncements: true,
        assertiveAnnouncements: false // Use for critical only
      },

      keyboardNavigation: {
        enabled: true,
        customShortcuts: {
          'alt+e': 'extend-session',
          'alt+s': 'save-work',
          'alt+l': 'logout',
          'alt+h': 'help',
          'f1': 'accessibility-help'
        },
        tabOrder: ['extend-session', 'save-work', 'help', 'logout'],
        escapeKeyAction: 'none', // Security: no escape key
        enterKeyAction: 'extend'
      },

      focusManagement: {
        autoFocus: 'extend-session',
        focusTrap: true,
        focusRestoration: true,
        customFocusTarget: '#primary-action-button'
      },

      reducedMotion: true, // Respect user preferences
      colorBlindnessSupport: true
    },

    customActions: [
      {
        id: 'extend-session',
        label: 'Extend Session (Alt+E)',
        icon: '', // No icons for screen readers
        variant: 'primary',
        position: 'center',
        order: 0,
        action: async () => ({
          success: true,
          shouldExtendSession: true,
          message: 'Your session has been successfully extended for another 30 minutes'
        })
      },
      {
        id: 'save-work',
        label: 'Save Work (Alt+S)',
        icon: '',
        variant: 'secondary',
        position: 'left',
        order: 1,
        action: async () => ({
          success: true,
          shouldExtendSession: true,
          message: 'Your work has been saved and session extended'
        })
      },
      {
        id: 'help',
        label: 'Help (Alt+H)',
        icon: '',
        variant: 'info',
        position: 'center',
        order: 2,
        action: async () => {
          // Open help dialog
          this.showAccessibilityHelp();
          return {
            success: true,
            message: 'Help information is now available'
          };
        }
      },
      {
        id: 'logout',
        label: 'Logout (Alt+L)',
        icon: '',
        variant: 'secondary',
        position: 'right',
        order: 3,
        action: async () => ({
          success: true,
          shouldCloseDialog: true,
          message: 'You have been logged out successfully'
        })
      }
    ],

    theme: {
      name: 'high-contrast-accessible',
      cssVariables: {
        // High contrast colors for accessibility
        'dialog-background': '#000000',
        'dialog-color': '#ffffff',
        'dialog-border': '4px solid #ffffff',
        'primary-color': '#00ff00',
        'secondary-color': '#ffff00',
        'focus-outline': '3px solid #ff00ff',
        'font-size-base': '18px', // Larger base font
        'line-height-base': '1.6' // Better line spacing
      },
      typography: {
        fontFamily: ['Arial', 'sans-serif'], // Simple fonts for screen readers
        fontSize: {
          title: '2rem',
          body: '1.25rem',
          button: '1.125rem'
        },
        lineHeight: {
          normal: 1.6,
          relaxed: 1.8
        }
      }
    }
  };

  showAccessibilityHelp() {
    // Implement accessibility help dialog
    console.log('Showing accessibility help...');
  }
}
```

## Testing Guide

### Unit Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnhancedIdleWarningDialogComponent } from './enhanced-idle-warning-dialog.component';
import { SecurityValidationService } from './services/security-validation.service';
import { TemplateService } from './services/template.service';

describe('EnhancedIdleWarningDialogComponent', () => {
  let component: EnhancedIdleWarningDialogComponent;
  let fixture: ComponentFixture<EnhancedIdleWarningDialogComponent>;
  let securityService: jasmine.SpyObj<SecurityValidationService>;
  let templateService: jasmine.SpyObj<TemplateService>;

  beforeEach(async () => {
    const securitySpy = jasmine.createSpyObj('SecurityValidationService', 
      ['validateConfiguration', 'validateCloseAction', 'createAuditLogEntry']);
    const templateSpy = jasmine.createSpyObj('TemplateService', 
      ['processTemplate', 'createTemplateVariables']);

    await TestBed.configureTestingModule({
      imports: [EnhancedIdleWarningDialogComponent],
      providers: [
        { provide: SecurityValidationService, useValue: securitySpy },
        { provide: TemplateService, useValue: templateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedIdleWarningDialogComponent);
    component = fixture.componentInstance;
    securityService = TestBed.inject(SecurityValidationService) as jasmine.SpyObj<SecurityValidationService>;
    templateService = TestBed.inject(TemplateService) as jasmine.SpyObj<TemplateService>;
  });

  describe('Security Validation', () => {
    it('should validate configuration on init', () => {
      component.config = BANKING_CONFIG;
      securityService.validateConfiguration.and.returnValue({
        isValid: true,
        violations: [],
        warnings: [],
        suggestions: []
      });

      component.ngOnInit();

      expect(securityService.validateConfiguration).toHaveBeenCalledWith(component.config);
    });

    it('should prevent close action when security validation fails', async () => {
      securityService.validateCloseAction.and.returnValue(Promise.resolve({
        allowed: false,
        reason: 'Insufficient permissions',
        requiresConfirmation: false,
        confirmationSteps: [],
        delaySeconds: 0
      }));

      await component.onCloseButtonClick();

      expect(component.showingCloseConfirmation()).toBeFalse();
    });

    it('should require confirmation for high-security close actions', async () => {
      securityService.validateCloseAction.and.returnValue(Promise.resolve({
        allowed: true,
        reason: '',
        requiresConfirmation: true,
        confirmationSteps: [{
          id: 'test-confirmation',
          title: 'Test',
          message: 'Test message',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'warning'
        }],
        delaySeconds: 0
      }));

      await component.onCloseButtonClick();

      expect(component.showingCloseConfirmation()).toBeTrue();
    });
  });

  describe('Multi-Stage Warnings', () => {
    it('should progress through warning stages correctly', () => {
      component.config = {
        ...ENTERPRISE_CONFIG,
        warningStages: [
          { id: 'stage1', name: 'Stage 1', triggerAtSeconds: 60, urgencyLevel: 'low', visualTreatment: {} },
          { id: 'stage2', name: 'Stage 2', triggerAtSeconds: 30, urgencyLevel: 'high', visualTreatment: {} }
        ]
      };

      // Simulate 45 seconds remaining (should trigger stage 2)
      component.timeRemaining.set(45000);

      expect(component.currentStage?.id).toBe('stage2');
      expect(component.currentStage?.urgencyLevel).toBe('high');
    });
  });

  describe('Accessibility', () => {
    it('should announce stage changes to screen readers', () => {
      spyOn(component, 'announceToScreenReader');
      
      const stage = {
        id: 'test-stage',
        name: 'Test Stage',
        triggerAtSeconds: 30,
        urgencyLevel: 'high' as const,
        visualTreatment: {}
      };

      component['announceStageChange'](stage);

      expect(component.announceToScreenReader).toHaveBeenCalledWith(
        jasmine.stringContaining('Warning level changed to high priority')
      );
    });

    it('should handle keyboard shortcuts correctly', () => {
      // Test keyboard navigation implementation
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        altKey: false
      });

      // Simulate keyboard handling
      document.dispatchEvent(keyboardEvent);

      // Verify appropriate action is triggered
    });
  });
});
```

### Integration Testing

```typescript
describe('Enhanced Idle Dialog Integration', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  @Component({
    template: `
      <enhanced-idle-warning-dialog 
        [config]="config"
        (actionExecuted)="onActionExecuted($event)"
        (securityEvent)="onSecurityEvent($event)">
      </enhanced-idle-warning-dialog>
    `
  })
  class TestHostComponent {
    config = ENTERPRISE_CONFIG;
    actionEvents: any[] = [];
    securityEvents: any[] = [];

    onActionExecuted(event: any) {
      this.actionEvents.push(event);
    }

    onSecurityEvent(event: any) {
      this.securityEvents.push(event);
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [EnhancedIdleWarningDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  it('should emit action events when custom actions are executed', async () => {
    component.config = {
      ...ENTERPRISE_CONFIG,
      customActions: [{
        id: 'test-action',
        label: 'Test Action',
        icon: '🧪',
        variant: 'primary',
        position: 'center',
        order: 0,
        action: async () => ({ success: true })
      }]
    };

    fixture.detectChanges();

    // Simulate action click
    const dialog = fixture.debugElement.query(
      By.directive(EnhancedIdleWarningDialogComponent)
    ).componentInstance;

    await dialog.onActionClick(component.config.customActions![0]);

    expect(component.actionEvents).toHaveLength(1);
    expect(component.actionEvents[0].action.id).toBe('test-action');
  });
});
```

### E2E Testing

```typescript
// Cypress E2E tests
describe('Enhanced Idle Dialog E2E', () => {
  beforeEach(() => {
    cy.visit('/test-page');
  });

  it('should display warning dialog after idle timeout', () => {
    // Wait for idle timeout
    cy.wait(10000);
    
    // Verify dialog appears
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#dialog-title').should('contain', 'Session Timeout Warning');
  });

  it('should handle multi-stage progression', () => {
    // Wait for different stages
    cy.wait(10000); // Initial stage
    cy.get('.stage-treatment').should('have.class', 'stage-low');
    
    cy.wait(30000); // Medium stage
    cy.get('.stage-treatment').should('have.class', 'stage-medium');
    
    cy.wait(60000); // High stage
    cy.get('.stage-treatment').should('have.class', 'stage-high');
  });

  it('should respect accessibility requirements', () => {
    cy.wait(10000); // Wait for dialog
    
    // Test keyboard navigation
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'aria-label').and('contain', 'Extend');
    
    // Test screen reader announcements
    cy.get('[aria-live="assertive"]').should('exist');
    
    // Test high contrast mode
    cy.get('.enhanced-dialog-container')
      .should('have.css', 'border')
      .and('match', /solid/);
  });

  it('should handle security confirmation flows', () => {
    // Configure high-security mode
    cy.window().then((win) => {
      win.testConfig = BANKING_CONFIG;
    });
    
    cy.reload();
    cy.wait(10000);
    
    // Try to close dialog
    cy.get('.enhanced-close-button').click();
    
    // Should show confirmation modal
    cy.get('.confirmation-overlay').should('be.visible');
    cy.get('#confirmation-title').should('contain', 'Confirm');
    
    // Test confirmation flow
    cy.get('input[type="text"]').type('CONFIRM');
    cy.get('.btn-danger').click();
    
    // Dialog should close
    cy.get('[role="dialog"]').should('not.exist');
  });
});
```

## Best Practices

### Security
1. Always use appropriate security profiles for your industry
2. Implement proper audit logging for compliance
3. Validate all custom actions with security checks
4. Use encrypted storage for sensitive configurations
5. Test security features thoroughly

### Accessibility
1. Always enable screen reader optimization
2. Provide keyboard shortcuts for all actions
3. Use high contrast themes when needed
4. Test with actual assistive technologies
5. Follow WCAG 2.1 AA guidelines

### Performance
1. Use lazy loading for large configurations
2. Implement proper cleanup in ngOnDestroy
3. Optimize custom templates for rendering
4. Use OnPush change detection strategy
5. Monitor memory usage with complex configurations

### User Experience
1. Design clear, actionable warning messages
2. Use appropriate urgency levels
3. Provide multiple action options when possible
4. Test with real users in your target environment
5. Consider cultural and language differences

## Troubleshooting

### Common Issues

**Configuration Validation Errors**
```typescript
// Check validation result
const validation = this.securityService.validateConfiguration(config);
if (!validation.isValid) {
  console.error('Configuration errors:', validation.violations);
}
```

**Template Security Violations**
```typescript
// Validate template before use
const templateResult = this.templateService.validateTemplateSecurity(
  htmlTemplate, 
  SecurityLevel.HIGH
);
if (!templateResult.isSecure) {
  console.error('Template security issues:', templateResult.violations);
}
```

**Multi-Tab Synchronization Issues**
```typescript
// Debug multi-tab coordination
if (config.enableMultiTab) {
  console.log('Multi-tab channel:', config.multiTabChannelName);
  console.log('Idle core instance:', this.idleCore);
}
```

### Debug Mode

```typescript
// Enable debug logging
const debugConfig: EnhancedIdleDialogConfig = {
  ...yourConfig,
  onSecurityEvent: (event) => {
    console.log('DEBUG - Security Event:', event);
  },
  onAuditLog: (entry) => {
    console.log('DEBUG - Audit Log:', entry);
  }
};
```

This comprehensive implementation provides enterprise-grade session timeout management with maximum security, accessibility, and customization capabilities while maintaining industry compliance standards.