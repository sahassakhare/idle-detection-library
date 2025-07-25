import { TemplateRef } from '@angular/core';

// Security Profiles for Industry-Specific Compliance
export enum SecurityProfile {
  BANKING = 'banking',
  HEALTHCARE = 'healthcare', 
  ENTERPRISE = 'enterprise',
  ECOMMERCE = 'ecommerce',
  CONSUMER = 'consumer'
}

// Security Control Levels
export enum SecurityLevel {
  MAXIMUM = 'maximum',     // No customization allowed
  HIGH = 'high',          // Limited customization
  MEDIUM = 'medium',      // Balanced customization
  LOW = 'low',           // Flexible customization
  MINIMAL = 'minimal'     // Full customization
}

// Close Button Security Configuration
export interface CloseButtonSecurity {
  enabled: boolean;
  delaySeconds?: number;                    // Time before close becomes available
  requireConfirmation?: boolean;            // Multi-step confirmation
  confirmationSteps?: ConfirmationStep[];   // Custom confirmation workflow
  auditLog?: boolean;                       // Log all dismissal actions
  roleRestrictions?: string[];              // Roles that can use close button
  progressiveRestriction?: boolean;         // Restrict as timeout approaches
  customAction?: (context: SecurityContext) => Promise<boolean>;
}

export interface ConfirmationStep {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'warning' | 'danger' | 'info';
  requiresInput?: boolean;                  // Require text input confirmation
  expectedInput?: string;                   // Expected confirmation text
}

// Security Context for Audit and Validation
export interface SecurityContext {
  userId?: string;
  userRole?: string;
  sessionId: string;
  ipAddress?: string;
  timestamp: Date;
  actionType: 'close' | 'extend' | 'logout' | 'custom';
  additionalData?: Record<string, any>;
}

// Custom Action Framework
export interface CustomAction {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info';
  position: 'left' | 'center' | 'right';
  order: number;
  visible?: (context: SecurityContext) => boolean;
  enabled?: (context: SecurityContext) => boolean;
  requiresConfirmation?: boolean;
  confirmationConfig?: ConfirmationStep;
  securityValidation?: (context: SecurityContext) => Promise<boolean>;
  action: (context: SecurityContext) => Promise<ActionResult>;
  auditLog?: boolean;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  shouldCloseDialog?: boolean;
  shouldExtendSession?: boolean;
  redirectUrl?: string;
  additionalData?: Record<string, any>;
}

// Template System Configuration
export interface TemplateConfig {
  customTemplate?: TemplateRef<any>;        // Angular template reference
  htmlTemplate?: string;                    // Raw HTML template
  templateVariables?: Record<string, any>;  // Dynamic template variables
  securityValidation?: boolean;             // Validate template for security
  preserveAccessibility?: boolean;          // Maintain ARIA attributes
  allowedElements?: string[];               // Permitted HTML elements
  forbiddenElements?: string[];             // Blocked HTML elements
  customStyles?: Record<string, string>;    // Inline styles
}

// Multi-Stage Warning System
export interface WarningStage {
  id: string;
  name: string;
  triggerAtSeconds: number;                 // Seconds remaining when stage triggers
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  visualTreatment: VisualTreatment;
  soundAlert?: SoundConfig;
  vibrationPattern?: number[];              // Vibration pattern for mobile
  customNotification?: NotificationConfig;
  actions?: string[];                       // Available action IDs for this stage
}

export interface VisualTreatment {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  textColor?: string;
  iconColor?: string;
  animation?: AnimationConfig;
  customCssClass?: string;
}

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'elastic' | 'pulse';
  duration: number;                         // Animation duration in ms
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;                          // Delay before animation starts
  direction?: 'up' | 'down' | 'left' | 'right' | 'center';
}

export interface SoundConfig {
  enabled: boolean;
  soundFile?: string;                      // Custom sound file URL
  volume?: number;                         // 0-1 volume level
  repeat?: boolean;                        // Repeat sound
  respectUserPreferences?: boolean;        // Honor system sound settings
}

export interface NotificationConfig {
  type: 'browser' | 'toast' | 'banner' | 'modal';
  title: string;
  message: string;
  icon?: string;
  persistent?: boolean;                    // Don't auto-dismiss
  actionable?: boolean;                    // Include action buttons
}

// Advanced Theming System
export interface ThemeConfig {
  name: string;
  cssVariables?: Record<string, string>;   // CSS custom properties
  customStylesheet?: string;               // URL to external stylesheet
  typography?: TypographyConfig;
  colors?: ColorPalette;
  spacing?: SpacingConfig;
  effects?: EffectsConfig;
  responsive?: ResponsiveConfig;
}

export interface TypographyConfig {
  fontFamily?: string[];
  fontSize?: {
    title?: string;
    body?: string;
    caption?: string;
    button?: string;
  };
  fontWeight?: {
    light?: number;
    regular?: number;
    medium?: number;
    bold?: number;
  };
  lineHeight?: {
    tight?: number;
    normal?: number;
    relaxed?: number;
  };
}

export interface ColorPalette {
  primary?: string;
  secondary?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  light?: string;
  dark?: string;
  background?: string;
  surface?: string;
  overlay?: string;
  text?: {
    primary?: string;
    secondary?: string;
    disabled?: string;
    inverse?: string;
  };
}

export interface SpacingConfig {
  unit?: number;                           // Base spacing unit (px)
  scale?: number[];                        // Spacing scale multipliers
  padding?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  margin?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}

export interface EffectsConfig {
  borderRadius?: {
    small?: string;
    medium?: string;
    large?: string;
    round?: string;
  };
  shadows?: {
    small?: string;
    medium?: string;
    large?: string;
    inner?: string;
  };
  transitions?: {
    fast?: string;
    normal?: string;
    slow?: string;
  };
}

export interface ResponsiveConfig {
  breakpoints?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
  };
  mobileOverrides?: Partial<ThemeConfig>;
  tabletOverrides?: Partial<ThemeConfig>;
  desktopOverrides?: Partial<ThemeConfig>;
}

// Accessibility Configuration
export interface AccessibilityConfig {
  screenReaderOptimized?: boolean;
  highContrastMode?: boolean;
  keyboardNavigation?: KeyboardConfig;
  focusManagement?: FocusConfig;
  announcements?: AnnouncementConfig;
  reducedMotion?: boolean;
  colorBlindnessSupport?: boolean;
}

export interface KeyboardConfig {
  enabled?: boolean;
  customShortcuts?: Record<string, string>; // Key combination -> action mapping
  tabOrder?: string[];                      // Custom tab order
  escapeKeyAction?: 'close' | 'extend' | 'none' | 'custom';
  enterKeyAction?: 'extend' | 'close' | 'none' | 'custom';
}

export interface FocusConfig {
  autoFocus?: 'first-button' | 'close-button' | 'extend-button' | 'custom';
  focusTrap?: boolean;                      // Trap focus within dialog
  focusRestoration?: boolean;               // Restore focus after close
  customFocusTarget?: string;               // CSS selector for custom focus
}

export interface AnnouncementConfig {
  announceOpen?: boolean;
  announceCountdown?: boolean;
  announceStageChanges?: boolean;
  customAnnouncements?: Record<string, string>;
  politeAnnouncements?: boolean;            // Use aria-live="polite"
  assertiveAnnouncements?: boolean;         // Use aria-live="assertive"
}

// Security Profile Configurations
export interface SecurityProfileConfig {
  profile: SecurityProfile;
  level: SecurityLevel;
  closeButton: CloseButtonSecurity;
  backdropDismissible: boolean;
  escapeKeyDismissible: boolean;
  customizationRestrictions: CustomizationRestriction[];
  auditingRequired: boolean;
  encryptedStorage: boolean;
  complianceValidation: boolean;
}

export interface CustomizationRestriction {
  property: string;                         // Property that's restricted
  reason: string;                          // Why it's restricted
  allowedValues?: any[];                   // Permitted values only
  validator?: (value: any) => boolean;     // Custom validation function
}

// Main Configuration Interface
export interface EnhancedIdleDialogConfig {
  // Basic Configuration
  idleTimeout: number;
  warningTimeout: number;
  
  // Security Profile
  securityProfile?: SecurityProfileConfig;
  
  // Template System
  template?: TemplateConfig;
  
  // Multi-Stage Warnings
  warningStages?: WarningStage[];
  
  // Custom Actions
  customActions?: CustomAction[];
  
  // Theming
  theme?: ThemeConfig;
  
  // Accessibility
  accessibility?: AccessibilityConfig;
  
  // Multi-Tab Coordination
  enableMultiTab?: boolean;
  multiTabChannelName?: string;
  
  // Callbacks
  onSecurityEvent?: (event: SecurityEvent) => void;
  onStageChange?: (stage: WarningStage) => void;
  onCustomAction?: (action: CustomAction, result: ActionResult) => void;
  onAuditLog?: (entry: AuditLogEntry) => void;
}

// Security and Audit Events
export interface SecurityEvent {
  type: 'unauthorized_access' | 'invalid_template' | 'security_violation' | 'compliance_check';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: SecurityContext;
  details: Record<string, any>;
  timestamp: Date;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  action: string;
  details: Record<string, any>;
  securityContext: SecurityContext;
  ipAddress?: string;
  userAgent?: string;
}

// Industry-Specific Preset Configurations
export const SECURITY_PROFILES: Record<SecurityProfile, SecurityProfileConfig> = {
  [SecurityProfile.BANKING]: {
    profile: SecurityProfile.BANKING,
    level: SecurityLevel.MAXIMUM,
    closeButton: {
      enabled: false,
      auditLog: true,
      roleRestrictions: ['admin', 'security_officer']
    },
    backdropDismissible: false,
    escapeKeyDismissible: false,
    customizationRestrictions: [
      { property: 'template', reason: 'Security compliance requires standard template' },
      { property: 'closeButton', reason: 'Banking regulations prohibit user dismissal' }
    ],
    auditingRequired: true,
    encryptedStorage: true,
    complianceValidation: true
  },
  
  [SecurityProfile.HEALTHCARE]: {
    profile: SecurityProfile.HEALTHCARE,
    level: SecurityLevel.HIGH,
    closeButton: {
      enabled: true,
      delaySeconds: 30,
      requireConfirmation: true,
      auditLog: true,
      roleRestrictions: ['doctor', 'nurse', 'admin']
    },
    backdropDismissible: false,
    escapeKeyDismissible: false,
    customizationRestrictions: [
      { property: 'auditLog', reason: 'HIPAA compliance requires audit logging' }
    ],
    auditingRequired: true,
    encryptedStorage: true,
    complianceValidation: true
  },
  
  [SecurityProfile.ENTERPRISE]: {
    profile: SecurityProfile.ENTERPRISE,
    level: SecurityLevel.MEDIUM,
    closeButton: {
      enabled: true,
      delaySeconds: 15,
      requireConfirmation: false,
      auditLog: true,
      progressiveRestriction: true
    },
    backdropDismissible: false,
    escapeKeyDismissible: true,
    customizationRestrictions: [],
    auditingRequired: true,
    encryptedStorage: false,
    complianceValidation: false
  },
  
  [SecurityProfile.ECOMMERCE]: {
    profile: SecurityProfile.ECOMMERCE,
    level: SecurityLevel.LOW,
    closeButton: {
      enabled: true,
      delaySeconds: 5,
      requireConfirmation: false,
      auditLog: false
    },
    backdropDismissible: true,
    escapeKeyDismissible: true,
    customizationRestrictions: [],
    auditingRequired: false,
    encryptedStorage: false,
    complianceValidation: false
  },
  
  [SecurityProfile.CONSUMER]: {
    profile: SecurityProfile.CONSUMER,
    level: SecurityLevel.MINIMAL,
    closeButton: {
      enabled: true,
      delaySeconds: 0,
      requireConfirmation: false,
      auditLog: false
    },
    backdropDismissible: true,
    escapeKeyDismissible: true,
    customizationRestrictions: [],
    auditingRequired: false,
    encryptedStorage: false,
    complianceValidation: false
  }
};