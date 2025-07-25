import { 
  EnhancedIdleDialogConfig,
  SecurityProfile,
  SECURITY_PROFILES,
  CustomAction,
  WarningStage,
  ThemeConfig,
  AccessibilityConfig
} from '../types/enhanced-types';

/**
 * Banking/Financial Industry Configuration
 * Maximum security with comprehensive audit logging
 */
export const BANKING_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 900000, // 15 minutes
  warningTimeout: 300000, // 5 minutes warning
  
  securityProfile: {
    ...SECURITY_PROFILES[SecurityProfile.BANKING],
    closeButton: {
      enabled: false, // No close button for maximum security
      auditLog: true,
      roleRestrictions: ['admin', 'security_officer']
    }
  },

  warningStages: [
    {
      id: 'initial-warning',
      name: 'Security Notice',
      triggerAtSeconds: 300, // 5 minutes
      urgencyLevel: 'low',
      visualTreatment: {
        backgroundColor: '#f8fafc',
        borderColor: '#3b82f6',
        borderWidth: '2px'
      }
    },
    {
      id: 'urgent-warning',
      name: 'Action Required',
      triggerAtSeconds: 120, // 2 minutes
      urgencyLevel: 'medium',
      visualTreatment: {
        backgroundColor: '#fffbeb',
        borderColor: '#f59e0b',
        borderWidth: '3px'
      },
      soundAlert: {
        enabled: true,
        volume: 0.5,
        respectUserPreferences: true
      }
    },
    {
      id: 'critical-warning',
      name: 'Final Notice',
      triggerAtSeconds: 30, // 30 seconds
      urgencyLevel: 'critical',
      visualTreatment: {
        backgroundColor: '#fef2f2',
        borderColor: '#dc2626',
        borderWidth: '4px',
        animation: {
          type: 'pulse',
          duration: 1000,
          easing: 'ease-in-out'
        }
      },
      soundAlert: {
        enabled: true,
        repeat: true,
        volume: 0.7
      }
    }
  ],

  customActions: [
    {
      id: 'extend-session',
      label: 'Extend Session',
      icon: '🔄',
      variant: 'primary',
      position: 'center',
      order: 0,
      requiresConfirmation: true,
      confirmationConfig: {
        id: 'extend-confirmation',
        title: 'Extend Banking Session',
        message: 'This action will extend your secure banking session. Please confirm this is you.',
        confirmText: 'Yes, Extend Session',
        cancelText: 'Cancel',
        type: 'info',
        requiresInput: true,
        expectedInput: 'EXTEND'
      },
      securityValidation: async (context) => {
        // Implement additional security checks
        return context.userRole === 'authenticated_user';
      },
      action: async (context) => {
        // Log the session extension
        console.log('Banking session extended', context);
        return {
          success: true,
          shouldExtendSession: true,
          message: 'Banking session has been securely extended'
        };
      },
      auditLog: true
    },
    {
      id: 'secure-logout',
      label: 'Secure Logout',
      icon: '🔒',
      variant: 'danger',
      position: 'right',
      order: 1,
      requiresConfirmation: true,
      confirmationConfig: {
        id: 'logout-confirmation',
        title: 'Confirm Secure Logout',
        message: 'You will be securely logged out of your banking session. Any unsaved changes will be lost.',
        confirmText: 'Yes, Logout Securely',
        cancelText: 'Cancel',
        type: 'warning'
      },
      action: async (context) => {
        // Implement secure logout
        console.log('Secure banking logout', context);
        return {
          success: true,
          shouldCloseDialog: true,
          redirectUrl: '/banking/secure-logout',
          message: 'You have been securely logged out'
        };
      },
      auditLog: true
    }
  ],

  theme: {
    name: 'banking-secure',
    cssVariables: {
      'dialog-background': '#ffffff',
      'dialog-border': '2px solid #1e40af',
      'dialog-shadow': '0 25px 50px rgba(30, 64, 175, 0.25)',
      'primary-color': '#1e40af',
      'danger-color': '#dc2626',
      'text-color': '#1f2937'
    },
    colors: {
      primary: '#1e40af',
      danger: '#dc2626',
      background: '#ffffff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280'
      }
    }
  },

  accessibility: {
    screenReaderOptimized: true,
    announcements: {
      announceOpen: true,
      announceCountdown: true,
      announceStageChanges: true
    },
    keyboardNavigation: {
      enabled: true,
      escapeKeyAction: 'none', // No escape key for banking
      enterKeyAction: 'extend'
    },
    focusManagement: {
      autoFocus: 'extend-button',
      focusTrap: true,
      focusRestoration: true
    }
  },

  onSecurityEvent: (event) => {
    console.log('Banking security event:', event);
    // Send to security monitoring system
  },

  onAuditLog: (entry) => {
    console.log('Banking audit log:', entry);
    // Send to compliance logging system
  }
};

/**
 * Healthcare/HIPAA Configuration
 * High security with patient data protection
 */
export const HEALTHCARE_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 600000, // 10 minutes (shorter for patient data)
  warningTimeout: 120000, // 2 minutes warning
  
  securityProfile: {
    ...SECURITY_PROFILES[SecurityProfile.HEALTHCARE],
    closeButton: {
      enabled: true,
      delaySeconds: 15, // 15 second delay
      requireConfirmation: true,
      confirmationSteps: [
        {
          id: 'hipaa-warning',
          title: 'HIPAA Compliance Notice',
          message: 'Closing this dialog may leave patient data accessible. Are you sure you want to continue?',
          confirmText: 'Yes, I Understand',
          cancelText: 'Keep Session Active',
          type: 'warning'
        },
        {
          id: 'final-confirmation',
          title: 'Final Confirmation',
          message: 'This action will be logged for HIPAA compliance. Please confirm.',
          confirmText: 'Confirm and Log',
          cancelText: 'Cancel',
          type: 'danger'
        }
      ],
      auditLog: true,
      roleRestrictions: ['doctor', 'nurse', 'admin', 'medical_staff']
    }
  },

  template: {
    templateVariables: {
      title: 'Patient Data Session Timeout',
      message: 'Your access to patient data will expire soon for HIPAA compliance.',
      secondaryMessage: 'This timeout protects sensitive patient information.'
    },
    preserveAccessibility: true,
    securityValidation: true
  },

  customActions: [
    {
      id: 'continue-patient-care',
      label: 'Continue Patient Care',
      icon: '🏥',
      variant: 'primary',
      position: 'center',
      order: 0,
      visible: (context) => ['doctor', 'nurse'].includes(context.userRole || ''),
      action: async (context) => {
        return {
          success: true,
          shouldExtendSession: true,
          message: 'Patient care session extended'
        };
      },
      auditLog: true
    },
    {
      id: 'secure-patient-data',
      label: 'Secure & Logout',
      icon: '[SECURE]',
      variant: 'secondary',
      position: 'right',
      order: 1,
      action: async (context) => {
        // Implement patient data securing
        return {
          success: true,
          shouldCloseDialog: true,
          message: 'Patient data has been secured'
        };
      },
      auditLog: true
    }
  ],

  theme: {
    name: 'healthcare-hipaa',
    cssVariables: {
      'dialog-background': '#f8fafc',
      'dialog-border': '2px solid #059669',
      'primary-color': '#059669',
      'warning-color': '#d97706'
    }
  }
};

/**
 * Enterprise Configuration
 * Balanced security with customization flexibility
 */
export const ENTERPRISE_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 1800000, // 30 minutes
  warningTimeout: 300000, // 5 minutes warning
  
  securityProfile: SECURITY_PROFILES[SecurityProfile.ENTERPRISE],

  warningStages: [
    {
      id: 'gentle-reminder',
      name: 'Session Check',
      triggerAtSeconds: 240, // 4 minutes
      urgencyLevel: 'low',
      visualTreatment: {
        backgroundColor: '#f0f9ff',
        borderColor: '#3b82f6'
      }
    },
    {
      id: 'action-needed',
      name: 'Action Needed',
      triggerAtSeconds: 60, // 1 minute
      urgencyLevel: 'medium',
      visualTreatment: {
        backgroundColor: '#fffbeb',
        borderColor: '#f59e0b'
      },
      customNotification: {
        type: 'browser',
        title: 'Session Expiring',
        message: 'Your work session will expire in 1 minute',
        persistent: false
      }
    },
    {
      id: 'urgent-action',
      name: 'Urgent',
      triggerAtSeconds: 15, // 15 seconds
      urgencyLevel: 'high',
      visualTreatment: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        animation: {
          type: 'bounce',
          duration: 500,
          easing: 'ease-out'
        }
      }
    }
  ],

  customActions: [
    {
      id: 'save-and-continue',
      label: 'Save & Continue',
      icon: '💾',
      variant: 'primary',
      position: 'left',
      order: 0,
      action: async (context) => {
        // Implement auto-save functionality
        console.log('Auto-saving work...', context);
        return {
          success: true,
          shouldExtendSession: true,
          message: 'Work saved and session extended'
        };
      }
    },
    {
      id: 'extend-session',
      label: 'Continue Working',
      icon: '⏰',
      variant: 'primary',
      position: 'center',
      order: 1,
      action: async () => ({
        success: true,
        shouldExtendSession: true
      })
    },
    {
      id: 'save-and-logout',
      label: 'Save & Logout',
      icon: '📤',
      variant: 'secondary',
      position: 'right',
      order: 2,
      requiresConfirmation: true,
      confirmationConfig: {
        id: 'save-logout-confirm',
        title: 'Save Work and Logout',
        message: 'Your current work will be saved before logging out.',
        confirmText: 'Save & Logout',
        cancelText: 'Cancel',
        type: 'info'
      },
      action: async (context) => {
        // Implement save and logout
        console.log('Saving and logging out...', context);
        return {
          success: true,
          shouldCloseDialog: true,
          message: 'Work saved successfully'
        };
      }
    }
  ],

  theme: {
    name: 'enterprise-professional',
    cssVariables: {
      'dialog-background': '#ffffff',
      'dialog-border-radius': '16px',
      'dialog-shadow': '0 20px 60px rgba(0, 0, 0, 0.15)',
      'primary-color': '#3b82f6',
      'secondary-color': '#6b7280'
    },
    typography: {
      fontFamily: ['Inter', 'system-ui', 'sans-serif'],
      fontSize: {
        title: '1.5rem',
        body: '1rem',
        button: '0.875rem'
      }
    }
  },

  accessibility: {
    screenReaderOptimized: true,
    keyboardNavigation: {
      enabled: true,
      customShortcuts: {
        'ctrl+s': 'save-and-continue',
        'ctrl+e': 'extend-session'
      }
    }
  }
};

/**
 * E-commerce Configuration
 * User-friendly with cart preservation
 */
export const ECOMMERCE_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 1200000, // 20 minutes
  warningTimeout: 180000, // 3 minutes warning
  
  securityProfile: SECURITY_PROFILES[SecurityProfile.ECOMMERCE],

  customActions: [
    {
      id: 'save-cart-continue',
      label: 'Keep Shopping',
      icon: '🛒',
      variant: 'primary',
      position: 'center',
      order: 0,
      action: async (context) => {
        // Save shopping cart
        console.log('Saving shopping cart...', context);
        return {
          success: true,
          shouldExtendSession: true,
          message: 'Your cart has been saved and session extended'
        };
      }
    },
    {
      id: 'checkout-now',
      label: 'Checkout Now',
      icon: '💳',
      variant: 'success',
      position: 'left',
      order: 1,
      action: async () => ({
        success: true,
        shouldCloseDialog: true,
        redirectUrl: '/checkout'
      })
    },
    {
      id: 'save-for-later',
      label: 'Save for Later',
      icon: '❤️',
      variant: 'secondary',
      position: 'right',
      order: 2,
      action: async (context) => {
        // Save to wishlist
        console.log('Saving to wishlist...', context);
        return {
          success: true,
          shouldCloseDialog: true,
          message: 'Items saved to your wishlist'
        };
      }
    }
  ],

  template: {
    templateVariables: {
      title: 'Don\'t Lose Your Cart!',
      message: 'Your shopping session is about to expire.',
      secondaryMessage: 'Save your cart or continue shopping to keep your items.'
    }
  },

  theme: {
    name: 'ecommerce-friendly',
    cssVariables: {
      'dialog-background': 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
      'dialog-border': '2px solid #0ea5e9',
      'primary-color': '#0ea5e9',
      'success-color': '#059669'
    }
  }
};

/**
 * Consumer/Social Configuration
 * Maximum UX flexibility
 */
export const CONSUMER_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 3600000, // 60 minutes
  warningTimeout: 300000, // 5 minutes warning
  
  securityProfile: SECURITY_PROFILES[SecurityProfile.CONSUMER],

  warningStages: [
    {
      id: 'friendly-reminder',
      name: 'Still there?',
      triggerAtSeconds: 240,
      urgencyLevel: 'low',
      visualTreatment: {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
        animation: {
          type: 'slide',
          duration: 300,
          direction: 'down'
        }
      }
    }
  ],

  customActions: [
    {
      id: 'stay-logged-in',
      label: 'Yes, I\'m Here!',
      icon: '👋',
      variant: 'primary',
      position: 'center',
      order: 0,
      action: async () => ({
        success: true,
        shouldExtendSession: true,
        message: 'Great! Your session has been extended.'
      })
    },
    {
      id: 'logout-me',
      label: 'Log Me Out',
      icon: '👋',
      variant: 'secondary',
      position: 'right',
      order: 1,
      action: async () => ({
        success: true,
        shouldCloseDialog: true,
        message: 'See you next time!'
      })
    }
  ],

  template: {
    templateVariables: {
      title: 'Are you still there?',
      message: 'You\'ve been quiet for a while. Want to stay logged in?',
      secondaryMessage: 'No worries if you need to step away!'
    }
  },

  theme: {
    name: 'consumer-friendly',
    cssVariables: {
      'dialog-background': '#ffffff',
      'dialog-border-radius': '24px',
      'dialog-shadow': '0 20px 60px rgba(0, 0, 0, 0.08)',
      'primary-color': '#8b5cf6',
      'secondary-color': '#a3a3a3'
    },
    typography: {
      fontFamily: ['Poppins', 'system-ui', 'sans-serif'],
      fontSize: {
        title: '1.75rem',
        body: '1.125rem'
      }
    }
  },

  accessibility: {
    keyboardNavigation: {
      enabled: true,
      escapeKeyAction: 'close',
      enterKeyAction: 'extend'
    }
  }
};

/**
 * Custom Template Example
 * Demonstrates HTML template customization
 */
export const CUSTOM_TEMPLATE_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 900000,
  warningTimeout: 180000,
  
  securityProfile: SECURITY_PROFILES[SecurityProfile.ENTERPRISE],

  template: {
    htmlTemplate: `
      <div class="custom-dialog">
        <div class="header-section">
          <div class="logo">
            <img src="/assets/company-logo.png" alt="Company Logo" />
          </div>
          <h1>{{title}}</h1>
        </div>
        
        <div class="content-section">
          <div class="message-area">
            <p class="primary-message">{{message}}</p>
            <div class="time-display">
              <span class="time-label">Time Remaining:</span>
              <span class="time-value">{{formattedTime}}</span>
            </div>
          </div>
          
          <div class="progress-area">
            <div class="progress-bar" style="width: {{progressPercentage}}%"></div>
          </div>
        </div>
        
        <div class="actions-section">
          <button class="action-btn primary" data-action="extend">
            <i class="icon-refresh"></i>
            Continue Working
          </button>
          <button class="action-btn secondary" data-action="logout">
            <i class="icon-logout"></i>
            Secure Logout
          </button>
        </div>
        
        <div class="footer-section">
          <small>This session is protected by enterprise security policies.</small>
        </div>
      </div>
    `,
    templateVariables: {
      title: 'Enterprise Session Management',
      message: 'Your secure work session requires attention.'
    },
    securityValidation: true,
    preserveAccessibility: true,
    customStyles: {
      'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'color': 'white',
      'border-radius': '20px'
    }
  }
};

/**
 * Accessibility-First Configuration
 * Optimized for screen readers and keyboard navigation
 */
export const ACCESSIBILITY_CONFIG: EnhancedIdleDialogConfig = {
  idleTimeout: 1800000,
  warningTimeout: 300000,
  
  securityProfile: SECURITY_PROFILES[SecurityProfile.ENTERPRISE],

  accessibility: {
    screenReaderOptimized: true,
    highContrastMode: true,
    announcements: {
      announceOpen: true,
      announceCountdown: true,
      announceStageChanges: true,
      customAnnouncements: {
        'session-extended': 'Your session has been successfully extended',
        'session-ending': 'Your session will end in {{timeRemaining}}',
        'stage-changed': 'Warning level changed to {{urgencyLevel}}'
      }
    },
    keyboardNavigation: {
      enabled: true,
      customShortcuts: {
        'alt+e': 'extend-session',
        'alt+l': 'logout',
        'alt+s': 'save-work'
      },
      tabOrder: ['extend-session', 'save-work', 'logout'],
      escapeKeyAction: 'custom',
      enterKeyAction: 'extend'
    },
    focusManagement: {
      autoFocus: 'extend-button',
      focusTrap: true,
      focusRestoration: true
    },
    reducedMotion: true,
    colorBlindnessSupport: true
  },

  customActions: [
    {
      id: 'extend-session',
      label: 'Extend Session (Alt+E)',
      icon: '',
      variant: 'primary',
      position: 'center',
      order: 0,
      action: async () => ({
        success: true,
        shouldExtendSession: true
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
        message: 'Your work has been saved'
      })
    },
    {
      id: 'logout',
      label: 'Logout (Alt+L)',
      icon: '',
      variant: 'secondary',
      position: 'right',
      order: 2,
      action: async () => ({
        success: true,
        shouldCloseDialog: true
      })
    }
  ],

  theme: {
    name: 'accessibility-optimized',
    cssVariables: {
      // High contrast colors
      'dialog-background': '#000000',
      'dialog-color': '#ffffff',
      'dialog-border': '3px solid #ffffff',
      'primary-color': '#00ff00',
      'secondary-color': '#ffff00',
      'focus-color': '#ff00ff'
    }
  }
};

// Export all configurations for easy access
export const CONFIGURATION_EXAMPLES = {
  BANKING_CONFIG,
  HEALTHCARE_CONFIG,
  ENTERPRISE_CONFIG,
  ECOMMERCE_CONFIG,
  CONSUMER_CONFIG,
  CUSTOM_TEMPLATE_CONFIG,
  ACCESSIBILITY_CONFIG
};

// Utility function to get configuration by industry
export function getConfigurationByIndustry(industry: string): EnhancedIdleDialogConfig {
  switch (industry.toLowerCase()) {
    case 'banking':
    case 'financial':
      return BANKING_CONFIG;
    case 'healthcare':
    case 'medical':
      return HEALTHCARE_CONFIG;
    case 'enterprise':
    case 'corporate':
      return ENTERPRISE_CONFIG;
    case 'ecommerce':
    case 'retail':
      return ECOMMERCE_CONFIG;
    case 'consumer':
    case 'social':
      return CONSUMER_CONFIG;
    default:
      return ENTERPRISE_CONFIG; // Default fallback
  }
}