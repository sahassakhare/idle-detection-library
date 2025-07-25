import { Injectable, TemplateRef, ViewContainerRef, EmbeddedViewRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { 
  TemplateConfig, 
  SecurityLevel, 
  EnhancedIdleDialogConfig,
  WarningStage 
} from '../types/enhanced-types';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private defaultTemplate = `
    <div class="enhanced-idle-dialog" 
         role="dialog" 
         aria-modal="true" 
         aria-labelledby="dialog-title" 
         aria-describedby="dialog-message">
      
      <!-- Header Section -->
      <div class="dialog-header" *ngIf="{{showTitle}}">
        <div class="title-section">
          <h2 id="dialog-title" class="dialog-title">{{title}}</h2>
          <button *ngIf="{{showCloseButton}}" 
                  class="close-button" 
                  [disabled]="{{closeButtonDisabled}}"
                  (click)="onCloseClick()"
                  aria-label="Close dialog">
            <span class="close-icon">×</span>
          </button>
        </div>
        <div class="urgency-indicator" 
             [class]="{{urgencyClass}}"
             [attr.aria-label]="{{urgencyLabel}}">
        </div>
      </div>

      <!-- Main Content -->
      <div class="dialog-body">
        <!-- Stage-based visual treatment -->
        <div class="stage-indicator" [class]="{{stageClass}}">
          <div class="stage-icon" [innerHTML]="{{stageIcon}}"></div>
        </div>

        <!-- Message Section -->
        <div id="dialog-message" class="dialog-message">
          <p class="primary-message">{{message}}</p>
          <p class="secondary-message" *ngIf="{{secondaryMessage}}">{{secondaryMessage}}</p>
        </div>

        <!-- Progress Section -->
        <div class="progress-section" *ngIf="{{showProgress}}">
          <!-- Countdown Timer -->
          <div class="countdown-display" 
               aria-live="polite" 
               aria-atomic="true"
               [attr.aria-label]="{{countdownLabel}}">
            <span class="countdown-label">{{countdownText}}</span>
            <span class="countdown-time">{{timeRemaining}}</span>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container" 
               role="progressbar" 
               [attr.aria-valuenow]="{{progressValue}}"
               [attr.aria-valuemax]="{{progressMax}}"
               [attr.aria-label]="{{progressLabel}}">
            <div class="progress-track">
              <div class="progress-fill" 
                   [style.width.%]="{{progressPercentage}}"
                   [class]="{{progressClass}}">
              </div>
            </div>
          </div>

          <!-- Stage Progress Indicators -->
          <div class="stage-indicators" *ngIf="{{showStageIndicators}}">
            <div class="stage-dot" 
                 *ngFor="let stage of {{stages}}"
                 [class.active]="{{stage.active}}"
                 [class.completed]="{{stage.completed}}"
                 [attr.aria-label]="{{stage.label}}">
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="dialog-actions">
        <!-- Primary Actions -->
        <div class="primary-actions">
          <button *ngFor="let action of {{primaryActions}}"
                  [class]="action.class"
                  [disabled]="action.disabled"
                  [attr.aria-label]="action.ariaLabel"
                  (click)="onActionClick(action)">
            <span class="action-icon" *ngIf="action.icon" [innerHTML]="action.icon"></span>
            <span class="action-text">{{action.text}}</span>
          </button>
        </div>

        <!-- Secondary Actions -->
        <div class="secondary-actions" *ngIf="{{secondaryActions.length > 0}}">
          <button *ngFor="let action of {{secondaryActions}}"
                  [class]="action.class"
                  [disabled]="action.disabled"
                  [attr.aria-label]="action.ariaLabel"
                  (click)="onActionClick(action)">
            <span class="action-icon" *ngIf="action.icon" [innerHTML]="action.icon"></span>
            <span class="action-text">{{action.text}}</span>
          </button>
        </div>
      </div>

      <!-- Security Footer -->
      <div class="security-footer" *ngIf="{{showSecurityInfo}}">
        <div class="security-badge" [attr.aria-label]="{{securityBadgeLabel}}">
          <span class="security-icon">🔒</span>
          <span class="security-text">{{securityText}}</span>
        </div>
        <div class="compliance-info" *ngIf="{{complianceInfo}}">
          <small>{{complianceInfo}}</small>
        </div>
      </div>
    </div>
  `;

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Processes template with variables and security validation
   */
  processTemplate(
    config: EnhancedIdleDialogConfig,
    variables: TemplateVariables,
    viewContainer?: ViewContainerRef
  ): ProcessedTemplate {
    const templateConfig = config.template;
    
    if (!templateConfig) {
      // Use default template
      return this.processDefaultTemplate(variables);
    }

    // Handle Angular TemplateRef
    if (templateConfig.customTemplate && viewContainer) {
      return this.processAngularTemplate(templateConfig.customTemplate, variables, viewContainer);
    }

    // Handle HTML string template
    if (templateConfig.htmlTemplate) {
      return this.processHtmlTemplate(templateConfig, variables, config);
    }

    // Fallback to default
    return this.processDefaultTemplate(variables);
  }

  /**
   * Creates template variables from current state
   */
  createTemplateVariables(
    timeRemaining: number,
    currentStage: WarningStage | null,
    config: EnhancedIdleDialogConfig,
    additionalData: Record<string, any> = {}
  ): TemplateVariables {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    return {
      // Time-related variables
      timeRemaining: this.formatTime(timeRemaining),
      totalMinutes: minutes,
      totalSeconds: Math.floor(timeRemaining / 1000),
      minutes: minutes,
      seconds: seconds,
      formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      
      // Progress-related variables
      progressValue: timeRemaining,
      progressMax: config.warningTimeout,
      progressPercentage: Math.max(0, (timeRemaining / config.warningTimeout) * 100),
      progressClass: this.getProgressClass(timeRemaining, config.warningTimeout),
      
      // Stage-related variables
      currentStage: currentStage?.name || 'initial',
      stageClass: currentStage ? `stage-${currentStage.urgencyLevel}` : 'stage-initial',
      stageIcon: this.getStageIcon(currentStage),
      urgencyClass: currentStage ? `urgency-${currentStage.urgencyLevel}` : '',
      urgencyLabel: this.getUrgencyLabel(currentStage),
      
      // Content variables
      title: config.template?.templateVariables?.title || 'Session Timeout Warning',
      message: config.template?.templateVariables?.message || 'Your session will expire soon.',
      secondaryMessage: config.template?.templateVariables?.secondaryMessage || '',
      
      // UI state variables
      showTitle: true,
      showCloseButton: this.shouldShowCloseButton(config),
      closeButtonDisabled: this.isCloseButtonDisabled(config, timeRemaining),
      showProgress: true,
      showStageIndicators: Boolean(config.warningStages && config.warningStages.length > 1),
      
      // Actions variables
      primaryActions: this.getPrimaryActions(config),
      secondaryActions: this.getSecondaryActions(config),
      
      // Security variables
      showSecurityInfo: this.shouldShowSecurityInfo(config),
      securityText: this.getSecurityText(config),
      securityBadgeLabel: this.getSecurityBadgeLabel(config),
      complianceInfo: this.getComplianceInfo(config),
      
      // Stage progression
      stages: this.getStageProgression(config, currentStage),
      
      // Countdown labels
      countdownText: 'Time remaining:',
      countdownLabel: `Time remaining: ${this.formatTime(timeRemaining)}`,
      progressLabel: `Session timeout progress: ${Math.round((timeRemaining / config.warningTimeout) * 100)}% remaining`,
      
      // Custom variables from config
      ...config.template?.templateVariables,
      ...additionalData
    };
  }

  /**
   * Validates template security
   */
  validateTemplateSecurity(html: string, securityLevel: SecurityLevel): TemplateSecurityResult {
    const result: TemplateSecurityResult = {
      isSecure: true,
      violations: [],
      sanitizedHtml: html
    };

    // Basic sanitization
    const sanitized = this.sanitizeHtml(html);
    if (sanitized !== html) {
      result.sanitizedHtml = sanitized;
      result.violations.push({
        type: 'sanitization',
        message: 'Template content was sanitized for security',
        severity: 'medium'
      });
    }

    // Security level specific checks
    switch (securityLevel) {
      case SecurityLevel.MAXIMUM:
        result.violations.push(...this.validateMaximumSecurity(html));
        break;
      case SecurityLevel.HIGH:
        result.violations.push(...this.validateHighSecurity(html));
        break;
      case SecurityLevel.MEDIUM:
        result.violations.push(...this.validateMediumSecurity(html));
        break;
      default:
        // Low and minimal security - basic sanitization only
        break;
    }

    result.isSecure = result.violations.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0;
    
    return result;
  }

  /**
   * Private helper methods
   */
  private processDefaultTemplate(variables: TemplateVariables): ProcessedTemplate {
    const processedHtml = this.replaceTemplateVariables(this.defaultTemplate, variables);
    
    return {
      type: 'html',
      content: processedHtml,
      isSecure: true,
      variables: variables
    };
  }

  private processAngularTemplate(
    template: TemplateRef<any>, 
    variables: TemplateVariables,
    viewContainer: ViewContainerRef
  ): ProcessedTemplate {
    const view = viewContainer.createEmbeddedView(template, variables);
    
    return {
      type: 'angular',
      content: view,
      isSecure: true,
      variables: variables
    };
  }

  private processHtmlTemplate(
    templateConfig: TemplateConfig, 
    variables: TemplateVariables,
    config: EnhancedIdleDialogConfig
  ): ProcessedTemplate {
    let html = templateConfig.htmlTemplate!;
    
    // Validate security if required
    const securityLevel = config.securityProfile?.level || SecurityLevel.MEDIUM;
    const securityResult = this.validateTemplateSecurity(html, securityLevel);
    
    if (templateConfig.securityValidation && !securityResult.isSecure) {
      throw new Error(`Template security validation failed: ${securityResult.violations.map(v => v.message).join(', ')}`);
    }

    // Use sanitized HTML
    html = securityResult.sanitizedHtml;
    
    // Replace template variables
    const processedHtml = this.replaceTemplateVariables(html, variables);
    
    return {
      type: 'html',
      content: processedHtml,
      isSecure: securityResult.isSecure,
      variables: variables,
      securityViolations: securityResult.violations
    };
  }

  private replaceTemplateVariables(template: string, variables: TemplateVariables): string {
    let processed = template;
    
    // Replace {{variable}} patterns
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, this.stringifyValue(value));
    });
    
    return processed;
  }

  private stringifyValue(value: any): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private sanitizeHtml(html: string): string {
    // Use Angular's DomSanitizer
    const sanitized = this.sanitizer.sanitize(1, html); // SecurityContext.HTML = 1
    return sanitized || '';
  }

  private shouldShowCloseButton(config: EnhancedIdleDialogConfig): boolean {
    return config.securityProfile?.closeButton?.enabled ?? true;
  }

  private isCloseButtonDisabled(config: EnhancedIdleDialogConfig, timeRemaining: number): boolean {
    const delaySeconds = config.securityProfile?.closeButton?.delaySeconds || 0;
    const delayMs = delaySeconds * 1000;
    const warningTimeout = config.warningTimeout;
    
    return timeRemaining > (warningTimeout - delayMs);
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getProgressClass(timeRemaining: number, warningTimeout: number): string {
    const percentage = (timeRemaining / warningTimeout) * 100;
    
    if (percentage > 75) return 'progress-safe';
    if (percentage > 50) return 'progress-warning';
    if (percentage > 25) return 'progress-danger';
    return 'progress-critical';
  }

  private getStageIcon(stage: WarningStage | null): string {
    if (!stage) return '⏱';
    
    switch (stage.urgencyLevel) {
      case 'low': return '⏱';
      case 'medium': return '!';
      case 'high': return '!!';
      case 'critical': return '!!!';
      default: return '⏱';
    }
  }

  private getUrgencyLabel(stage: WarningStage | null): string {
    if (!stage) return 'Session timeout notice';
    
    switch (stage.urgencyLevel) {
      case 'low': return 'Session timeout notice';
      case 'medium': return 'Session timeout warning';
      case 'high': return 'Urgent: Session about to expire';
      case 'critical': return 'Critical: Session expiring now';
      default: return 'Session timeout notice';
    }
  }

  private getPrimaryActions(config: EnhancedIdleDialogConfig): ActionButton[] {
    const actions: ActionButton[] = [];
    
    // Default extend action
    actions.push({
      id: 'extend',
      text: 'Extend Session',
      class: 'btn btn-primary',
      disabled: false,
      ariaLabel: 'Extend your session to continue working',
      icon: '🔄'
    });
    
    // Add custom primary actions
    if (config.customActions) {
      const primaryCustom = config.customActions
        .filter(action => action.variant === 'primary')
        .sort((a, b) => a.order - b.order)
        .map(action => ({
          id: action.id,
          text: action.label,
          class: `btn btn-${action.variant}`,
          disabled: false,
          ariaLabel: action.label,
          icon: action.icon
        }));
      
      actions.unshift(...primaryCustom);
    }
    
    return actions;
  }

  private getSecondaryActions(config: EnhancedIdleDialogConfig): ActionButton[] {
    const actions: ActionButton[] = [];
    
    // Default logout action
    actions.push({
      id: 'logout',
      text: 'Logout',
      class: 'btn btn-secondary',
      disabled: false,
      ariaLabel: 'Logout and end your session',
      icon: '🚪'
    });
    
    // Add custom secondary actions
    if (config.customActions) {
      const secondaryCustom = config.customActions
        .filter(action => action.variant === 'secondary')
        .sort((a, b) => a.order - b.order)
        .map(action => ({
          id: action.id,
          text: action.label,
          class: `btn btn-${action.variant}`,
          disabled: false,
          ariaLabel: action.label,
          icon: action.icon
        }));
      
      actions.push(...secondaryCustom);
    }
    
    return actions;
  }

  private shouldShowSecurityInfo(config: EnhancedIdleDialogConfig): boolean {
    return config.securityProfile?.profile !== undefined;
  }

  private getSecurityText(config: EnhancedIdleDialogConfig): string {
    const profile = config.securityProfile?.profile;
    switch (profile) {
      case 'banking': return 'Banking Security Standard';
      case 'healthcare': return 'HIPAA Compliant';
      case 'enterprise': return 'Enterprise Security';
      case 'ecommerce': return 'Secure Session';
      default: return 'Secure Connection';
    }
  }

  private getSecurityBadgeLabel(config: EnhancedIdleDialogConfig): string {
    return `Security level: ${this.getSecurityText(config)}`;
  }

  private getComplianceInfo(config: EnhancedIdleDialogConfig): string {
    if (config.securityProfile?.complianceValidation) {
      return 'This dialog meets industry compliance requirements';
    }
    return '';
  }

  private getStageProgression(config: EnhancedIdleDialogConfig, currentStage: WarningStage | null): StageIndicator[] {
    if (!config.warningStages) return [];
    
    return config.warningStages.map(stage => ({
      id: stage.id,
      label: stage.name,
      active: currentStage?.id === stage.id,
      completed: currentStage ? stage.triggerAtSeconds > currentStage.triggerAtSeconds : false
    }));
  }

  private validateMaximumSecurity(_html: string): TemplateSecurityViolation[] {
    const violations: TemplateSecurityViolation[] = [];
    
    // No custom HTML allowed at maximum security
    violations.push({
      type: 'security_policy',
      message: 'Custom HTML templates are not allowed at maximum security level',
      severity: 'critical'
    });
    
    return violations;
  }

  private validateHighSecurity(html: string): TemplateSecurityViolation[] {
    const violations: TemplateSecurityViolation[] = [];
    
    // Very restricted HTML
    if (/<script|<iframe|<object|<embed/gi.test(html)) {
      violations.push({
        type: 'dangerous_elements',
        message: 'Dangerous HTML elements are not allowed',
        severity: 'critical'
      });
    }
    
    return violations;
  }

  private validateMediumSecurity(html: string): TemplateSecurityViolation[] {
    const violations: TemplateSecurityViolation[] = [];
    
    // Basic security checks
    if (/<script/gi.test(html)) {
      violations.push({
        type: 'script_tags',
        message: 'Script tags are not allowed',
        severity: 'high'
      });
    }
    
    return violations;
  }
}

// Supporting interfaces
export interface TemplateVariables {
  [key: string]: any;
  timeRemaining: string;
  totalMinutes: number;
  totalSeconds: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  progressValue: number;
  progressMax: number;
  progressPercentage: number;
  progressClass: string;
  currentStage: string;
  stageClass: string;
  stageIcon: string;
  urgencyClass: string;
  urgencyLabel: string;
  title: string;
  message: string;
  secondaryMessage: string;
  showTitle: boolean;
  showCloseButton: boolean;
  closeButtonDisabled: boolean;
  showProgress: boolean;
  showStageIndicators: boolean;
  primaryActions: ActionButton[];
  secondaryActions: ActionButton[];
  showSecurityInfo: boolean;
  securityText: string;
  securityBadgeLabel: string;
  complianceInfo: string;
  stages: StageIndicator[];
  countdownText: string;
  countdownLabel: string;
  progressLabel: string;
}

export interface ProcessedTemplate {
  type: 'html' | 'angular';
  content: string | EmbeddedViewRef<any>;
  isSecure: boolean;
  variables: TemplateVariables;
  securityViolations?: TemplateSecurityViolation[];
}

export interface TemplateSecurityResult {
  isSecure: boolean;
  violations: TemplateSecurityViolation[];
  sanitizedHtml: string;
}

export interface TemplateSecurityViolation {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActionButton {
  id: string;
  text: string;
  class: string;
  disabled: boolean;
  ariaLabel: string;
  icon?: string;
}

export interface StageIndicator {
  id: string;
  label: string;
  active: boolean;
  completed: boolean;
}