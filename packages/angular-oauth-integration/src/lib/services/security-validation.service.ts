import { Injectable } from '@angular/core';
import { 
  SecurityLevel, 
  SecurityContext, 
  SecurityEvent, 
  AuditLogEntry, 
  EnhancedIdleDialogConfig,
  TemplateConfig,
  CustomAction,
  SECURITY_PROFILES
} from '../types/enhanced-types';

@Injectable({
  providedIn: 'root'
})
export class SecurityValidationService {
  private auditLog: AuditLogEntry[] = [];
  private securityEvents: SecurityEvent[] = [];

  /**
   * Validates configuration against security profile requirements
   */
  validateConfiguration(config: EnhancedIdleDialogConfig): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: []
    };

    if (!config.securityProfile) {
      result.warnings.push({
        property: 'securityProfile',
        message: 'No security profile specified - using default consumer profile',
        severity: 'low'
      });
      return result;
    }

    const profile = SECURITY_PROFILES[config.securityProfile.profile];
    
    // Validate customization restrictions
    for (const restriction of profile.customizationRestrictions) {
      const violation = this.checkCustomizationRestriction(config, restriction);
      if (violation) {
        result.violations.push(violation);
        result.isValid = false;
      }
    }

    // Validate template security
    if (config.template) {
      const templateValidation = this.validateTemplate(config.template, profile);
      result.violations.push(...templateValidation.violations);
      result.warnings.push(...templateValidation.warnings);
      if (templateValidation.violations.length > 0) {
        result.isValid = false;
      }
    }

    // Validate custom actions
    if (config.customActions) {
      const actionsValidation = this.validateCustomActions(config.customActions, profile);
      result.violations.push(...actionsValidation.violations);
      result.warnings.push(...actionsValidation.warnings);
      if (actionsValidation.violations.length > 0) {
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validates HTML template for security compliance
   */
  validateTemplate(template: TemplateConfig, securityProfile: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: []
    };

    if (template.htmlTemplate) {
      // Check for dangerous elements and attributes
      const dangerousElements = this.findDangerousElements(template.htmlTemplate);
      if (dangerousElements.length > 0) {
        result.violations.push({
          property: 'template.htmlTemplate',
          message: `Dangerous elements found: ${dangerousElements.join(', ')}`,
          severity: 'high'
        });
      }

      // Check for script tags
      if (template.htmlTemplate.includes('<script')) {
        result.violations.push({
          property: 'template.htmlTemplate',
          message: 'Script tags are not allowed in templates',
          severity: 'critical'
        });
      }

      // Check for inline event handlers
      const inlineEvents = this.findInlineEventHandlers(template.htmlTemplate);
      if (inlineEvents.length > 0) {
        result.violations.push({
          property: 'template.htmlTemplate',
          message: `Inline event handlers found: ${inlineEvents.join(', ')}`,
          severity: 'high'
        });
      }

      // Validate accessibility requirements
      if (template.preserveAccessibility !== false) {
        const accessibilityIssues = this.validateTemplateAccessibility(template.htmlTemplate);
        result.warnings.push(...accessibilityIssues);
      }
    }

    return result;
  }

  /**
   * Validates custom actions for security compliance
   */
  validateCustomActions(actions: CustomAction[], profile: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: []
    };

    for (const action of actions) {
      // Validate action ID is safe
      if (!this.isValidActionId(action.id)) {
        result.violations.push({
          property: `customActions.${action.id}`,
          message: 'Action ID contains invalid characters',
          severity: 'medium'
        });
      }

      // Check if action requires security validation
      if (profile.level === SecurityLevel.MAXIMUM && !action.securityValidation) {
        result.violations.push({
          property: `customActions.${action.id}`,
          message: 'Security validation is required for this security profile',
          severity: 'high'
        });
      }

      // Validate audit logging requirements
      if (profile.auditingRequired && action.auditLog !== true) {
        result.warnings.push({
          property: `customActions.${action.id}`,
          message: 'Audit logging is recommended for this security profile',
          severity: 'low'
        });
      }
    }

    return result;
  }

  /**
   * Creates audit log entry
   */
  createAuditLogEntry(
    action: string, 
    context: SecurityContext, 
    details: Record<string, any> = {}
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: context.userId,
      sessionId: context.sessionId,
      action,
      details,
      securityContext: context,
      ipAddress: context.ipAddress,
      userAgent: navigator.userAgent
    };

    this.auditLog.push(entry);
    return entry;
  }

  /**
   * Creates security event
   */
  createSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    context: SecurityContext,
    details: Record<string, any> = {}
  ): SecurityEvent {
    const event: SecurityEvent = {
      type,
      severity,
      context,
      details,
      timestamp: new Date()
    };

    this.securityEvents.push(event);
    return event;
  }

  /**
   * Checks if user has permission for specific action
   */
  async checkUserPermission(
    context: SecurityContext, 
    requiredRoles: string[]
  ): Promise<boolean> {
    if (!context.userRole) {
      return false;
    }

    return requiredRoles.includes(context.userRole);
  }

  /**
   * Validates close button action based on security rules
   */
  async validateCloseAction(
    context: SecurityContext,
    config: EnhancedIdleDialogConfig
  ): Promise<CloseValidationResult> {
    const result: CloseValidationResult = {
      allowed: false,
      reason: '',
      requiresConfirmation: false,
      confirmationSteps: [],
      delaySeconds: 0
    };

    const closeConfig = config.securityProfile?.closeButton;
    if (!closeConfig?.enabled) {
      result.reason = 'Close button is disabled by security policy';
      return result;
    }

    // Check role permissions
    if (closeConfig.roleRestrictions) {
      const hasPermission = await this.checkUserPermission(context, closeConfig.roleRestrictions);
      if (!hasPermission) {
        result.reason = 'User does not have permission to close dialog';
        return result;
      }
    }

    // Apply time delay
    if (closeConfig.delaySeconds && closeConfig.delaySeconds > 0) {
      result.delaySeconds = closeConfig.delaySeconds;
    }

    // Check if confirmation is required
    if (closeConfig.requireConfirmation) {
      result.requiresConfirmation = true;
      result.confirmationSteps = closeConfig.confirmationSteps || [
        {
          id: 'default-confirmation',
          title: 'Confirm Action',
          message: 'Are you sure you want to close this dialog?',
          confirmText: 'Yes, Close',
          cancelText: 'Cancel',
          type: 'warning'
        }
      ];
    }

    result.allowed = true;
    return result;
  }

  /**
   * Gets audit log entries
   */
  getAuditLog(filter?: AuditLogFilter): AuditLogEntry[] {
    let filtered = [...this.auditLog];

    if (filter) {
      if (filter.userId) {
        filtered = filtered.filter(entry => entry.userId === filter.userId);
      }
      if (filter.sessionId) {
        filtered = filtered.filter(entry => entry.sessionId === filter.sessionId);
      }
      if (filter.action) {
        filtered = filtered.filter(entry => entry.action === filter.action);
      }
      if (filter.startDate) {
        filtered = filtered.filter(entry => entry.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(entry => entry.timestamp <= filter.endDate!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Gets security events
   */
  getSecurityEvents(filter?: SecurityEventFilter): SecurityEvent[] {
    let filtered = [...this.securityEvents];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(event => event.type === filter.type);
      }
      if (filter.severity) {
        filtered = filtered.filter(event => event.severity === filter.severity);
      }
      if (filter.startDate) {
        filtered = filtered.filter(event => event.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(event => event.timestamp <= filter.endDate!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Private helper methods
   */
  private checkCustomizationRestriction(
    config: EnhancedIdleDialogConfig, 
    restriction: any
  ): SecurityViolation | null {
    const value = this.getNestedProperty(config, restriction.property);
    
    if (restriction.allowedValues && !restriction.allowedValues.includes(value)) {
      return {
        property: restriction.property,
        message: `${restriction.reason}. Allowed values: ${restriction.allowedValues.join(', ')}`,
        severity: 'high'
      };
    }

    if (restriction.validator && !restriction.validator(value)) {
      return {
        property: restriction.property,
        message: restriction.reason,
        severity: 'high'
      };
    }

    return null;
  }

  private findDangerousElements(html: string): string[] {
    const dangerous = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'];
    const found: string[] = [];
    
    for (const element of dangerous) {
      const regex = new RegExp(`<${element}`, 'gi');
      if (regex.test(html)) {
        found.push(element);
      }
    }
    
    return found;
  }

  private findInlineEventHandlers(html: string): string[] {
    const events = ['onclick', 'onload', 'onerror', 'onmouseover', 'onchange'];
    const found: string[] = [];
    
    for (const event of events) {
      const regex = new RegExp(`${event}\\s*=`, 'gi');
      if (regex.test(html)) {
        found.push(event);
      }
    }
    
    return found;
  }

  private validateTemplateAccessibility(html: string): SecurityWarning[] {
    const warnings: SecurityWarning[] = [];
    
    // Check for missing alt attributes on images
    if (/<img(?![^>]*alt=)/gi.test(html)) {
      warnings.push({
        property: 'template.accessibility',
        message: 'Images should have alt attributes for accessibility',
        severity: 'low'
      });
    }

    // Check for missing aria-labels on interactive elements
    if (/<button(?![^>]*aria-label)/gi.test(html)) {
      warnings.push({
        property: 'template.accessibility',
        message: 'Interactive elements should have aria-label attributes',
        severity: 'low'
      });
    }

    return warnings;
  }

  private isValidActionId(id: string): boolean {
    // Only alphanumeric characters, hyphens, and underscores
    return /^[a-zA-Z0-9_-]+$/.test(id);
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Supporting interfaces
export interface ValidationResult {
  isValid: boolean;
  violations: SecurityViolation[];
  warnings: SecurityWarning[];
  suggestions: SecuritySuggestion[];
}

export interface SecurityViolation {
  property: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityWarning {
  property: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SecuritySuggestion {
  property: string;
  message: string;
  suggestedValue?: any;
}

export interface CloseValidationResult {
  allowed: boolean;
  reason: string;
  requiresConfirmation: boolean;
  confirmationSteps: any[];
  delaySeconds: number;
}

export interface AuditLogFilter {
  userId?: string;
  sessionId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SecurityEventFilter {
  type?: SecurityEvent['type'];
  severity?: SecurityEvent['severity'];
  startDate?: Date;
  endDate?: Date;
}