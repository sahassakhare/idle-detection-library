import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  Renderer2,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Idle, MultiTabExpiry, IdleEvent } from '@idle-detection/core';

import { 
  EnhancedIdleDialogConfig,
  SecurityProfile,
  WarningStage,
  CustomAction,
  ActionResult,
  SecurityContext,
  ThemeConfig,
  SECURITY_PROFILES
} from './types/enhanced-types';

import { SecurityValidationService } from './services/security-validation.service';
import { 
  TemplateService, 
  ProcessedTemplate 
} from './services/template.service';

@Component({
  selector: 'enhanced-idle-warning-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      *ngIf="isWarningShown()"
      [class]="backdropClass"
      [ngClass]="computedBackdropClasses()"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="dialogTitleId"
      [attr.aria-describedby]="dialogMessageId"
      (click)="onBackdropClick($event)"
      [style]="backdropStyles()"
    >
      <!-- Close Button Confirmation Modal -->
      <div 
        *ngIf="showCloseConfirmation()" 
        class="confirmation-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <div class="confirmation-dialog">
          <div class="confirmation-content">
            <h3 id="confirmation-title">{{ currentConfirmationStep()?.title }}</h3>
            <p>{{ currentConfirmationStep()?.message }}</p>
            
            <!-- Text Input Confirmation -->
            <div *ngIf="currentConfirmationStep()?.requiresInput" class="confirmation-input">
              <label for="confirmation-text">
                Type "{{ currentConfirmationStep()?.expectedInput }}" to confirm:
              </label>
              <input 
                id="confirmation-text"
                type="text" 
                [(ngModel)]="confirmationInput"
                class="form-control"
                [attr.aria-describedby]="'confirmation-help'"
              >
              <small id="confirmation-help" class="form-text">
                This action requires explicit confirmation for security.
              </small>
            </div>
          </div>
          
          <div class="confirmation-actions">
            <button 
              type="button"
              class="btn btn-danger"
              [disabled]="!isConfirmationValid()"
              (click)="confirmCloseAction()"
              [attr.aria-label]="currentConfirmationStep()?.confirmText"
            >
              {{ currentConfirmationStep()?.confirmText }}
            </button>
            <button 
              type="button"
              class="btn btn-secondary"
              (click)="cancelCloseAction()"
              [attr.aria-label]="currentConfirmationStep()?.cancelText"
            >
              {{ currentConfirmationStep()?.cancelText }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Dialog Content -->
      <div 
        class="enhanced-dialog-container"
        [ngClass]="computedDialogClasses()"
        [style]="dialogStyles()"
        (click)="$event.stopPropagation()"
        #dialogContainer
      >
        <!-- Custom Template Content -->
        <div 
          *ngIf="processedTemplate" 
          [innerHTML]="getTemplateContent()"
          class="custom-template-content"
        >
        </div>

        <!-- Default Template (fallback) -->
        <div *ngIf="!processedTemplate" class="default-template-content">
          <!-- Security Delay Overlay -->
          <div 
            *ngIf="closeButtonDelayActive()" 
            class="security-delay-overlay"
            [attr.aria-live]="'polite'"
            [attr.aria-atomic]="'true'"
          >
            <div class="delay-message">
              <div class="security-icon">🔒</div>
              <p>Close button will be available in {{ closeButtonDelayRemaining() }} seconds</p>
              <div class="delay-progress">
                <div 
                  class="delay-progress-bar" 
                  [style.width.%]="closeButtonDelayProgress()"
                ></div>
              </div>
            </div>
          </div>

          <!-- Multi-Stage Visual Treatment -->
          <div 
            class="stage-treatment"
            [ngClass]="currentStageClass()"
            [style]="stageStyles()"
          >
            <!-- Stage Indicator -->
            <div class="stage-indicator" [attr.aria-label]="stageAriaLabel()">
              <div class="stage-icon" [innerHTML]="stageIcon()"></div>
              <div class="stage-pulse" *ngIf="shouldShowPulse()"></div>
            </div>

            <!-- Urgency Banner -->
            <div 
              *ngIf="showUrgencyBanner()" 
              class="urgency-banner"
              [ngClass]="urgencyBannerClass()"
              role="alert"
              [attr.aria-live]="urgencyBannerAriaLive()"
            >
              {{ urgencyBannerText() }}
            </div>
          </div>

          <!-- Header Section -->
          <div class="dialog-header">
            <div class="title-section">
              <h2 
                [id]="dialogTitleId"
                class="dialog-title"
                [ngClass]="titleClasses()"
              >
                {{ computedTitle() }}
              </h2>
              
              <!-- Enhanced Close Button -->
              <button 
                *ngIf="shouldShowCloseButton()"
                type="button"
                class="enhanced-close-button"
                [ngClass]="closeButtonClasses()"
                [disabled]="isCloseButtonDisabled()"
                [attr.aria-label]="closeButtonAriaLabel()"
                (click)="onCloseButtonClick()"
                #closeButton
              >
                <span class="close-icon" [innerHTML]="closeButtonIcon()"></span>
                <span *ngIf="closeButtonDelayActive()" class="delay-indicator">
                  {{ closeButtonDelayRemaining() }}
                </span>
              </button>
            </div>

            <!-- Progress Indicators -->
            <div class="progress-section" *ngIf="showProgressSection()">
              <!-- Time Remaining Display -->
              <div 
                class="time-display"
                [attr.aria-live]="'polite'"
                [attr.aria-atomic]="'true'"
                [attr.aria-label]="timeRemainingAriaLabel()"
              >
                <span class="time-label">{{ timeLabel() }}</span>
                <span class="time-value" [ngClass]="timeValueClasses()">
                  {{ formattedTimeRemaining() }}
                </span>
              </div>

              <!-- Multi-Stage Progress Bar -->
              <div 
                class="enhanced-progress-container"
                role="progressbar"
                [attr.aria-valuenow]="progressValue()"
                [attr.aria-valuemax]="progressMax()"
                [attr.aria-label]="progressAriaLabel()"
              >
                <div class="progress-track">
                  <div 
                    class="progress-fill"
                    [ngClass]="progressFillClasses()"
                    [style.width.%]="progressPercentage()"
                  ></div>
                  
                  <!-- Stage Markers -->
                  <div 
                    *ngFor="let stage of visibleStages()" 
                    class="stage-marker"
                    [ngClass]="getStageMarkerClasses(stage)"
                    [style.left.%]="getStagePosition(stage)"
                    [attr.aria-label]="stage.name"
                  ></div>
                </div>
              </div>

              <!-- Stage Progression Indicators -->
              <div 
                *ngIf="showStageProgression()" 
                class="stage-progression"
                role="group"
                aria-label="Warning stage progression"
              >
                <div 
                  *ngFor="let stage of visibleStages()" 
                  class="stage-step"
                  [ngClass]="getStageStepClasses(stage)"
                  [attr.aria-label]="getStageStepAriaLabel(stage)"
                >
                  <div class="step-marker"></div>
                  <div class="step-label">{{ stage.name }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Section -->
          <div class="dialog-body">
            <div 
              [id]="dialogMessageId"
              class="dialog-message"
              [ngClass]="messageClasses()"
            >
              <p class="primary-message">{{ computedMessage() }}</p>
              <p 
                *ngIf="secondaryMessage()" 
                class="secondary-message"
                [innerHTML]="secondaryMessage()"
              >
              </p>
            </div>

            <!-- Security Information -->
            <div 
              *ngIf="showSecurityInfo()" 
              class="security-info"
              [attr.aria-label]="securityInfoAriaLabel()"
            >
              <div class="security-badge">
                <span class="security-shield">🛡️</span>
                <span class="security-text">{{ securityBadgeText() }}</span>
              </div>
              <div *ngIf="complianceText()" class="compliance-info">
                <small>{{ complianceText() }}</small>
              </div>
            </div>
          </div>

          <!-- Enhanced Actions Section -->
          <div class="dialog-actions">
            <!-- Primary Actions -->
            <div class="primary-actions">
              <button 
                *ngFor="let action of primaryActions(); trackBy: trackByActionId"
                type="button"
                [ngClass]="getActionClasses(action)"
                [disabled]="isActionDisabled(action)"
                [attr.aria-label]="getActionAriaLabel(action)"
                (click)="onActionClick(action)"
              >
                <span *ngIf="action.icon" class="action-icon" [innerHTML]="action.icon"></span>
                <span class="action-text">{{ action.label }}</span>
                <span *ngIf="isActionProcessing(action)" class="action-spinner">⏳</span>
              </button>
            </div>

            <!-- Secondary Actions -->
            <div 
              *ngIf="secondaryActions().length > 0" 
              class="secondary-actions"
            >
              <button 
                *ngFor="let action of secondaryActions(); trackBy: trackByActionId"
                type="button"
                [ngClass]="getActionClasses(action)"
                [disabled]="isActionDisabled(action)"
                [attr.aria-label]="getActionAriaLabel(action)"
                (click)="onActionClick(action)"
              >
                <span *ngIf="action.icon" class="action-icon" [innerHTML]="action.icon"></span>
                <span class="action-text">{{ action.label }}</span>
                <span *ngIf="isActionProcessing(action)" class="action-spinner">⏳</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Accessibility Announcements -->
      <div 
        class="sr-only" 
        [attr.aria-live]="'assertive'"
        [attr.aria-atomic]="'true'"
      >
        {{ accessibilityAnnouncement() }}
      </div>
    </div>
  `,
  styles: [`
    /* Enhanced Dialog Styles */
    .enhanced-dialog-container {
      position: relative;
      background: var(--dialog-background, white);
      border-radius: var(--dialog-border-radius, 12px);
      padding: var(--dialog-padding, 32px);
      width: var(--dialog-width, 90%);
      max-width: var(--dialog-max-width, 600px);
      box-shadow: var(--dialog-shadow, 0 20px 60px rgba(0, 0, 0, 0.15));
      animation: var(--dialog-animation, enhancedSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1));
      border: var(--dialog-border, none);
    }

    @keyframes enhancedSlideIn {
      from { 
        transform: scale(0.9) translateY(-20px); 
        opacity: 0;
      }
      to { 
        transform: scale(1) translateY(0); 
        opacity: 1;
      }
    }

    /* Security Delay Overlay */
    .security-delay-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      border-radius: inherit;
    }

    .delay-message {
      text-align: center;
      color: white;
      padding: 20px;
    }

    .security-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .delay-progress {
      width: 200px;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      margin: 16px auto 0;
      overflow: hidden;
    }

    .delay-progress-bar {
      height: 100%;
      background: #3b82f6;
      transition: width 0.1s linear;
    }

    /* Multi-Stage Visual Treatment */
    .stage-treatment {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
    }

    .stage-indicator {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: var(--stage-background, white);
      border: 3px solid var(--stage-border, #e5e7eb);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stage-pulse {
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      border: 2px solid var(--stage-pulse-color, #3b82f6);
      animation: stagePulse 2s infinite;
    }

    @keyframes stagePulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    /* Stage-specific styling */
    .stage-treatment.stage-low {
      --stage-background: #f0f9ff;
      --stage-border: #3b82f6;
      --stage-pulse-color: #3b82f6;
    }

    .stage-treatment.stage-medium {
      --stage-background: #fffbeb;
      --stage-border: #f59e0b;
      --stage-pulse-color: #f59e0b;
    }

    .stage-treatment.stage-high {
      --stage-background: #fef2f2;
      --stage-border: #ef4444;
      --stage-pulse-color: #ef4444;
    }

    .stage-treatment.stage-critical {
      --stage-background: #7c2d12;
      --stage-border: #dc2626;
      --stage-pulse-color: #dc2626;
      color: white;
      animation: criticalPulse 1s infinite;
    }

    @keyframes criticalPulse {
      0%, 100% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.05); }
    }

    /* Urgency Banner */
    .urgency-banner {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--urgency-background, #dc2626);
      color: white;
      padding: 8px 16px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      margin-top: 8px;
    }

    .urgency-banner.critical {
      background: #7c2d12;
      animation: urgentFlash 0.5s infinite alternate;
    }

    @keyframes urgentFlash {
      0% { opacity: 1; }
      100% { opacity: 0.7; }
    }

    /* Enhanced Close Button */
    .enhanced-close-button {
      position: relative;
      width: 40px;
      height: 40px;
      border: none;
      background: var(--close-button-background, #f3f4f6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 18px;
      color: var(--close-button-color, #6b7280);
    }

    .enhanced-close-button:hover:not(:disabled) {
      background: var(--close-button-hover-background, #e5e7eb);
      transform: scale(1.05);
    }

    .enhanced-close-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .delay-indicator {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #dc2626;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }

    /* Enhanced Progress Section */
    .enhanced-progress-container {
      position: relative;
      margin: 16px 0;
    }

    .progress-track {
      height: 8px;
      background: var(--progress-track-background, #e5e7eb);
      border-radius: 4px;
      overflow: visible;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .progress-fill.safe { background: linear-gradient(90deg, #10b981, #059669); }
    .progress-fill.warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .progress-fill.danger { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .progress-fill.critical { 
      background: linear-gradient(90deg, #dc2626, #7c2d12);
      animation: criticalProgress 1s infinite;
    }

    @keyframes criticalProgress {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Stage Markers */
    .stage-marker {
      position: absolute;
      top: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      border: 2px solid #d1d5db;
      transform: translateX(-50%);
    }

    .stage-marker.active {
      border-color: #3b82f6;
      background: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }

    .stage-marker.completed {
      border-color: #10b981;
      background: #10b981;
    }

    /* Stage Progression */
    .stage-progression {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      padding: 0 8px;
    }

    .stage-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
    }

    .step-marker {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1d5db;
      margin-bottom: 4px;
    }

    .stage-step.active .step-marker {
      background: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .stage-step.completed .step-marker {
      background: #10b981;
    }

    .step-label {
      font-size: 10px;
      color: #6b7280;
      text-align: center;
      max-width: 60px;
    }

    .stage-step.active .step-label {
      color: #3b82f6;
      font-weight: 600;
    }

    /* Enhanced Actions */
    .dialog-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 32px;
    }

    .primary-actions, .secondary-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .dialog-actions button {
      position: relative;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      justify-content: center;
    }

    .action-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Security Information */
    .security-info {
      margin: 20px 0;
      padding: 16px;
      background: var(--security-info-background, #f8fafc);
      border: 1px solid var(--security-info-border, #e2e8f0);
      border-radius: 8px;
      text-align: center;
    }

    .security-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--security-badge-color, #475569);
    }

    .compliance-info {
      margin-top: 8px;
      color: var(--compliance-info-color, #64748b);
    }

    /* Confirmation Modal */
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .confirmation-dialog {
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    }

    .confirmation-content h3 {
      margin: 0 0 16px 0;
      color: #dc2626;
      font-size: 20px;
    }

    .confirmation-input {
      margin: 20px 0;
    }

    .confirmation-input label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .confirmation-input input {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .form-text {
      color: #6b7280;
      font-size: 12px;
      margin-top: 4px;
    }

    .confirmation-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .enhanced-dialog-container {
        margin: 16px;
        padding: 24px;
        width: calc(100% - 32px);
      }

      .dialog-actions {
        flex-direction: column;
      }

      .primary-actions, .secondary-actions {
        flex-direction: column;
      }

      .dialog-actions button {
        width: 100%;
      }
    }

    /* Accessibility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* High Contrast Mode */
    @media (prefers-contrast: high) {
      .enhanced-dialog-container {
        border: 2px solid;
      }
      
      .progress-fill {
        border: 1px solid;
      }
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .enhanced-dialog-container {
        animation: none;
      }
      
      .stage-pulse, .action-spinner {
        animation: none;
      }
    }
  `]
})
export class EnhancedIdleWarningDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() config!: EnhancedIdleDialogConfig;
  
  // Legacy inputs for backward compatibility
  @Input() idleTimeout?: number;
  @Input() warningTimeout?: number;
  @Input() title?: string;
  @Input() message?: string;
  @Input() onExtendCallback?: () => void;
  @Input() onLogoutCallback?: () => void;

  // Enhanced inputs
  @Input() customTemplate?: TemplateRef<any>;
  @Input() securityProfile?: SecurityProfile = SecurityProfile.CONSUMER;
  @Input() theme?: ThemeConfig;

  // Outputs
  @Output() actionExecuted = new EventEmitter<{ action: CustomAction; result: ActionResult }>();
  @Output() securityEvent = new EventEmitter<any>();
  @Output() stageChanged = new EventEmitter<WarningStage>();
  @Output() auditLog = new EventEmitter<any>();

  // Template reference
  @ViewChild('dialogContainer', { read: ElementRef }) dialogContainer!: ElementRef;
  @ViewChild('closeButton', { read: ElementRef }) closeButton!: ElementRef;

  // Component state
  private destroy$ = new Subject<void>();
  private securityContext!: SecurityContext;
  private currentStage = signal<WarningStage | null>(null);
  private processingActions = new Set<string>();
  
  // Multi-tab coordination
  private idleCore?: Idle;
  private multiTabExpiry?: MultiTabExpiry;

  // Signals for reactive state
  isWarningShown = signal(false);
  timeRemaining = signal(0);
  closeButtonDelayRemaining = signal(0);
  confirmationStepIndex = signal(0);
  confirmationInput = signal('');
  showingCloseConfirmation = signal(false);
  accessibilityAnnouncement = signal('');
  processedTemplate = signal<ProcessedTemplate | null>(null);

  // Template variables computed from state
  templateVariables = computed(() => 
    this.templateService.createTemplateVariables(
      this.timeRemaining(),
      this.currentStage(),
      this.mergedConfig(),
      {}
    )
  );

  // Dialog IDs for accessibility
  dialogTitleId = `dialog-title-${Math.random().toString(36).substring(2)}`;
  dialogMessageId = `dialog-message-${Math.random().toString(36).substring(2)}`;

  constructor(
    private securityService: SecurityValidationService,
    private templateService: TemplateService,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef
  ) {
    this.initializeSecurityContext();
  }

  ngOnInit(): void {
    // Merge configuration
    const merged = this.mergedConfig();
    
    // Validate configuration
    const validation = this.securityService.validateConfiguration(merged);
    if (!validation.isValid) {
      console.error('Configuration validation failed:', validation.violations);
      this.securityEvent.emit({
        type: 'invalid_configuration',
        violations: validation.violations
      });
    }

    // Process template
    this.processTemplate();

    // Setup idle detection
    this.setupIdleDetection();

    // Apply theme
    this.applyTheme();
  }

  ngAfterViewInit(): void {
    // Setup accessibility
    this.setupAccessibility();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
  }

  // Template computed properties
  mergedConfig = computed((): EnhancedIdleDialogConfig => ({
    idleTimeout: this.config?.idleTimeout || this.idleTimeout || 900000,
    warningTimeout: this.config?.warningTimeout || this.warningTimeout || 60000,
    securityProfile: this.config?.securityProfile || SECURITY_PROFILES[this.securityProfile!],
    template: this.config?.template,
    customActions: this.config?.customActions || [],
    warningStages: this.config?.warningStages || this.getDefaultStages(),
    theme: this.config?.theme || this.theme,
    accessibility: this.config?.accessibility || {},
    enableMultiTab: this.config?.enableMultiTab ?? true,
    multiTabChannelName: this.config?.multiTabChannelName || 'enhanced-idle-channel'
  }));

  // UI state computed properties
  computedTitle = computed(() => 
    this.templateVariables().title || this.title || 'Session Timeout Warning'
  );

  computedMessage = computed(() => 
    this.templateVariables().message || this.message || 'Your session will expire soon.'
  );

  formattedTimeRemaining = computed(() => {
    const ms = this.timeRemaining();
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  progressPercentage = computed(() => {
    const remaining = this.timeRemaining();
    const total = this.mergedConfig().warningTimeout;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  });

  // Security computed properties
  shouldShowCloseButton = computed(() => 
    this.mergedConfig().securityProfile?.closeButton?.enabled ?? true
  );

  isCloseButtonDisabled = computed(() => {
    const config = this.mergedConfig().securityProfile?.closeButton;
    if (!config?.enabled) return true;
    
    return this.closeButtonDelayRemaining() > 0;
  });

  closeButtonDelayActive = computed(() => 
    this.closeButtonDelayRemaining() > 0
  );

  closeButtonDelayProgress = computed(() => {
    const config = this.mergedConfig().securityProfile?.closeButton;
    const delaySeconds = config?.delaySeconds || 0;
    if (delaySeconds === 0) return 100;
    
    const remaining = this.closeButtonDelayRemaining();
    return Math.max(0, ((delaySeconds - remaining) / delaySeconds) * 100);
  });

  showCloseConfirmation = computed(() => 
    this.showingCloseConfirmation()
  );

  currentConfirmationStep = computed(() => {
    const config = this.mergedConfig().securityProfile?.closeButton;
    const steps = config?.confirmationSteps || [];
    const index = this.confirmationStepIndex();
    return steps[index] || null;
  });

  // Action computed properties
  primaryActions = computed(() => {
    const actions = this.mergedConfig().customActions || [];
    const primary = actions.filter(action => 
      action.variant === 'primary' && 
      (action.position === 'left' || action.position === 'center')
    ).sort((a, b) => a.order - b.order);

    // Add default extend action if none provided
    if (primary.length === 0) {
      return [{
        id: 'extend',
        label: 'Extend Session',
        icon: '🔄',
        variant: 'primary' as const,
        position: 'center' as const,
        order: 0,
        action: async () => ({ success: true, shouldExtendSession: true })
      }];
    }

    return primary;
  });

  secondaryActions = computed(() => {
    const actions = this.mergedConfig().customActions || [];
    const secondary = actions.filter(action => 
      action.variant === 'secondary' || action.variant === 'danger'
    ).sort((a, b) => a.order - b.order);

    // Add default logout action if none provided
    if (secondary.length === 0) {
      return [{
        id: 'logout',
        label: 'Logout',
        icon: '🚪',
        variant: 'secondary' as const,
        position: 'right' as const,
        order: 0,
        action: async () => ({ success: true, shouldCloseDialog: true })
      }];
    }

    return secondary;
  });

  // Stage computed properties
  currentStageClass = computed(() => {
    const stage = this.currentStage();
    return stage ? `stage-${stage.urgencyLevel}` : 'stage-initial';
  });

  stageIcon = computed(() => {
    const stage = this.currentStage();
    if (!stage) return '⏱';
    
    switch (stage.urgencyLevel) {
      case 'low': return '⏱';
      case 'medium': return '!';
      case 'high': return '!!';
      case 'critical': return '!!!';
      default: return '⏱';
    }
  });

  // Event handlers
  async onCloseButtonClick(): Promise<void> {
    const validation = await this.securityService.validateCloseAction(
      this.securityContext,
      this.mergedConfig()
    );

    if (!validation.allowed) {
      this.announceToScreenReader(`Close action denied: ${validation.reason}`);
      return;
    }

    if (validation.requiresConfirmation) {
      this.showingCloseConfirmation.set(true);
      this.confirmationStepIndex.set(0);
    } else {
      this.executeCloseAction();
    }
  }

  async onActionClick(action: CustomAction): Promise<void> {
    // Check if action is already processing
    if (this.processingActions.has(action.id)) {
      return;
    }

    // Mark as processing
    this.processingActions.add(action.id);

    try {
      // Security validation
      if (action.securityValidation) {
        const isValid = await action.securityValidation(this.securityContext);
        if (!isValid) {
          this.announceToScreenReader('Action denied by security policy');
          return;
        }
      }

      // User confirmation if required
      if (action.requiresConfirmation && action.confirmationConfig) {
        const confirmed = await this.showActionConfirmation(action.confirmationConfig);
        if (!confirmed) {
          return;
        }
      }

      // Execute action
      const result = await action.action(this.securityContext);

      // Handle result
      this.handleActionResult(action, result);

      // Emit event
      this.actionExecuted.emit({ action, result });

      // Audit log
      if (action.auditLog) {
        const logEntry = this.securityService.createAuditLogEntry(
          `custom_action_${action.id}`,
          this.securityContext,
          { actionLabel: action.label, result }
        );
        this.auditLog.emit(logEntry);
      }

    } catch (error) {
      console.error(`Action ${action.id} failed:`, error);
      this.announceToScreenReader(`Action failed: ${action.label}`);
    } finally {
      // Remove from processing
      this.processingActions.delete(action.id);
    }
  }

  onBackdropClick(_event: Event): void {
    const config = this.mergedConfig().securityProfile;
    if (config?.backdropDismissible) {
      // Only allow if explicitly enabled
      this.executeCloseAction();
    } else {
      // Log attempt for security
      this.securityService.createSecurityEvent(
        'unauthorized_access',
        'low',
        this.securityContext,
        { action: 'backdrop_click_attempt' }
      );
    }
  }

  // Template methods
  getTemplateContent(): string {
    const processed = this.processedTemplate();
    if (processed && processed.type === 'html') {
      return processed.content as string;
    }
    return '';
  }

  trackByActionId(_index: number, action: CustomAction): string {
    return action.id;
  }

  // Helper methods for template
  isActionDisabled(action: CustomAction): boolean {
    return this.processingActions.has(action.id) || 
           (action.enabled ? !action.enabled(this.securityContext) : false);
  }

  isActionProcessing(action: CustomAction): boolean {
    return this.processingActions.has(action.id);
  }

  getActionClasses(action: CustomAction): string {
    const baseClass = `btn btn-${action.variant}`;
    const processingClass = this.isActionProcessing(action) ? 'processing' : '';
    return `${baseClass} ${processingClass}`.trim();
  }

  getActionAriaLabel(action: CustomAction): string {
    const processing = this.isActionProcessing(action) ? ' (Processing...)' : '';
    return `${action.label}${processing}`;
  }

  // Private implementation methods
  private initializeSecurityContext(): void {
    this.securityContext = {
      userId: 'current-user', // Should be injected from auth service
      userRole: 'user',       // Should be injected from auth service
      sessionId: `session-${Date.now()}`,
      timestamp: new Date(),
      actionType: 'close'
    };
  }

  private processTemplate(): void {
    const processed = this.templateService.processTemplate(
      this.mergedConfig(),
      this.templateVariables(),
      this.viewContainer
    );
    this.processedTemplate.set(processed);
  }

  private setupIdleDetection(): void {
    const config = this.mergedConfig();
    
    if (config.enableMultiTab) {
      this.setupMultiTabCoordination();
    }
    
    // Start warning countdown
    this.startWarningCountdown();
    
    // Setup stage monitoring
    this.setupStageMonitoring();
    
    // Setup close button delay
    this.setupCloseButtonDelay();
  }

  private setupMultiTabCoordination(): void {
    const config = this.mergedConfig();
    
    this.idleCore = new Idle({
      idleTimeout: config.idleTimeout,
      warningTimeout: config.warningTimeout,
      idleName: config.multiTabChannelName
    });
    
    this.multiTabExpiry = new MultiTabExpiry(config.multiTabChannelName!);
    this.idleCore.setExpiry(this.multiTabExpiry);
    
    // Listen to core idle events
    this.idleCore.on(IdleEvent.IDLE_END, () => {
      console.log('[Enhanced Multi-Tab] Session extended in another tab');
      this.isWarningShown.set(false);
    });
    
    this.idleCore.watch();
  }

  private startWarningCountdown(): void {
    const config = this.mergedConfig();
    this.timeRemaining.set(config.warningTimeout);
    
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.isWarningShown()) return;
      const current = this.timeRemaining();
      if (current <= 0) {
        this.handleTimeout();
      } else {
        this.timeRemaining.set(current - 1000);
      }
    });
  }

  private setupStageMonitoring(): void {
    const stages = this.mergedConfig().warningStages || [];
    
    // Use interval to periodically check for stage changes
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const remaining = this.timeRemaining();
      const remainingSeconds = Math.ceil(remaining / 1000);
      
      // Find current stage
      const currentStage = stages
        .filter(stage => remainingSeconds <= stage.triggerAtSeconds)
        .sort((a, b) => b.triggerAtSeconds - a.triggerAtSeconds)[0];
      
      if (currentStage && currentStage !== this.currentStage()) {
        this.currentStage.set(currentStage);
        this.applyStageVisualTreatment(currentStage);
        this.announceStageChange(currentStage);
      }
    });
  }

  private setupCloseButtonDelay(): void {
    const delaySeconds = this.mergedConfig().securityProfile?.closeButton?.delaySeconds || 0;
    
    if (delaySeconds > 0) {
      this.closeButtonDelayRemaining.set(delaySeconds);
      
      interval(1000).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        if (this.closeButtonDelayRemaining() <= 0) return;
        const current = this.closeButtonDelayRemaining();
        this.closeButtonDelayRemaining.set(Math.max(0, current - 1));
      });
    }
  }

  private applyTheme(): void {
    const theme = this.mergedConfig().theme;
    if (!theme) return;
    
    const element = this.dialogContainer?.nativeElement;
    if (!element) return;
    
    // Apply CSS variables
    if (theme.cssVariables) {
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        this.renderer.setStyle(element, `--${property}`, value);
      });
    }
    
    // Apply custom stylesheet
    if (theme.customStylesheet) {
      const link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'stylesheet');
      this.renderer.setAttribute(link, 'href', theme.customStylesheet);
      this.renderer.appendChild(document.head, link);
    }
  }

  private setupAccessibility(): void {
    const config = this.mergedConfig().accessibility;
    
    if (config?.focusManagement?.autoFocus) {
      this.focusInitialElement(config.focusManagement.autoFocus);
    }
    
    if (config?.announcements?.announceOpen) {
      this.announceToScreenReader('Session timeout warning dialog opened');
    }
  }

  private focusInitialElement(target: 'first-button' | 'close-button' | 'extend-button' | 'custom'): void {
    setTimeout(() => {
      let element: HTMLElement | null = null;
      
      switch (target) {
        case 'first-button':
          element = this.dialogContainer.nativeElement.querySelector('button');
          break;
        case 'close-button':
          element = this.closeButton?.nativeElement;
          break;
        case 'extend-button':
          element = this.dialogContainer.nativeElement.querySelector('[data-action="extend"]');
          break;
        default:
          element = this.dialogContainer.nativeElement.querySelector(target);
      }
      
      element?.focus();
    }, 100);
  }

  private applyStageVisualTreatment(stage: WarningStage): void {
    const element = this.dialogContainer?.nativeElement;
    if (!element) return;
    
    const treatment = stage.visualTreatment;
    
    if (treatment.backgroundColor) {
      this.renderer.setStyle(element, 'background-color', treatment.backgroundColor);
    }
    
    if (treatment.borderColor) {
      this.renderer.setStyle(element, 'border-color', treatment.borderColor);
    }
    
    if (treatment.animation) {
      const animation = treatment.animation;
      const animationString = `${animation.type} ${animation.duration}ms ${animation.easing || 'ease'}`;
      this.renderer.setStyle(element, 'animation', animationString);
    }
  }

  private announceStageChange(stage: WarningStage): void {
    const urgencyText = this.getUrgencyText(stage.urgencyLevel);
    this.announceToScreenReader(`Warning level changed to ${urgencyText}. ${stage.name}`);
  }

  private announceToScreenReader(message: string): void {
    this.accessibilityAnnouncement.set(message);
    // Clear after announcement
    setTimeout(() => this.accessibilityAnnouncement.set(''), 1000);
  }

  private getUrgencyText(level: string): string {
    switch (level) {
      case 'low': return 'low priority';
      case 'medium': return 'medium priority';
      case 'high': return 'high priority';
      case 'critical': return 'critical';
      default: return 'normal';
    }
  }

  private async showActionConfirmation(_config: any): Promise<boolean> {
    return new Promise((resolve) => {
      // Implement confirmation dialog logic
      // For now, just resolve true
      resolve(true);
    });
  }

  private handleActionResult(_action: CustomAction, result: ActionResult): void {
    if (result.shouldExtendSession) {
      this.extendSession();
    }
    
    if (result.shouldCloseDialog) {
      this.isWarningShown.set(false);
    }
    
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
    
    if (result.message) {
      this.announceToScreenReader(result.message);
    }
  }

  private executeCloseAction(): void {
    // Create audit log
    this.securityService.createAuditLogEntry(
      'dialog_closed',
      this.securityContext,
      { method: 'close_button' }
    );
    
    this.isWarningShown.set(false);
  }

  private extendSession(): void {
    // Reset multi-tab coordination
    if (this.idleCore) {
      this.idleCore.reset();
    }
    
    // Call legacy callback
    if (this.onExtendCallback) {
      this.onExtendCallback();
    }
    
    this.isWarningShown.set(false);
  }

  private handleTimeout(): void {
    // Call legacy callback
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
    
    this.isWarningShown.set(false);
  }

  private getDefaultStages(): WarningStage[] {
    return [
      {
        id: 'initial',
        name: 'Session Expiring',
        triggerAtSeconds: 60,
        urgencyLevel: 'low',
        visualTreatment: {
          backgroundColor: '#f0f9ff',
          borderColor: '#3b82f6'
        }
      },
      {
        id: 'warning',
        name: 'Act Now',
        triggerAtSeconds: 30,
        urgencyLevel: 'medium',
        visualTreatment: {
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b'
        }
      },
      {
        id: 'critical',
        name: 'Final Warning',
        triggerAtSeconds: 10,
        urgencyLevel: 'critical',
        visualTreatment: {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444'
        }
      }
    ];
  }

  private cleanup(): void {
    if (this.idleCore) {
      this.idleCore.stop();
    }
  }

  // Template helper methods (continued in template)
  backdropClass = 'enhanced-idle-backdrop';
  
  computedBackdropClasses = computed(() => ({
    [`backdrop-${this.currentStageClass()}`]: true,
    'backdrop-multi-stage': (this.mergedConfig().warningStages?.length || 0) > 1
  }));

  backdropStyles = computed(() => ({}));
  dialogStyles = computed(() => ({}));
  titleClasses = computed(() => ({}));
  messageClasses = computed(() => ({}));
  timeLabel = computed(() => 'Time remaining:');
  timeValueClasses = computed(() => ({}));
  timeRemainingAriaLabel = computed(() => `Time remaining: ${this.formattedTimeRemaining()}`);
  progressValue = computed(() => this.timeRemaining());
  progressMax = computed(() => this.mergedConfig().warningTimeout);
  progressAriaLabel = computed(() => `Session timeout progress: ${Math.round(this.progressPercentage())}% remaining`);
  progressFillClasses = computed(() => {
    const percentage = this.progressPercentage();
    if (percentage > 75) return 'safe';
    if (percentage > 50) return 'warning';
    if (percentage > 25) return 'danger';
    return 'critical';
  });
  visibleStages = computed(() => this.mergedConfig().warningStages || []);
  showStageProgression = computed(() => (this.mergedConfig().warningStages?.length || 0) > 1);
  showProgressSection = computed(() => true);
  shouldShowPulse = computed(() => this.currentStage()?.urgencyLevel === 'critical');
  showUrgencyBanner = computed(() => this.currentStage()?.urgencyLevel === 'critical');
  urgencyBannerClass = computed(() => this.currentStage()?.urgencyLevel || '');
  urgencyBannerText = computed(() => 'URGENT: Session expiring now!');
  urgencyBannerAriaLive = computed(() => this.currentStage()?.urgencyLevel === 'critical' ? 'assertive' : 'polite');
  stageAriaLabel = computed(() => `Current stage: ${this.currentStage()?.name || 'Initial'}`);
  stageStyles = computed(() => ({}));
  closeButtonIcon = computed(() => '×');
  closeButtonAriaLabel = computed(() => {
    const disabled = this.isCloseButtonDisabled();
    const delay = this.closeButtonDelayRemaining();
    if (disabled && delay > 0) {
      return `Close button will be available in ${delay} seconds`;
    }
    return 'Close dialog';
  });
  closeButtonClasses = computed(() => ({}));
  secondaryMessage = computed(() => '');
  showSecurityInfo = computed(() => !!this.mergedConfig().securityProfile);
  securityBadgeText = computed(() => {
    const profile = this.mergedConfig().securityProfile?.profile;
    switch (profile) {
      case 'banking': return 'Banking Security Standard';
      case 'healthcare': return 'HIPAA Compliant';
      case 'enterprise': return 'Enterprise Security';
      default: return 'Secure Connection';
    }
  });
  securityInfoAriaLabel = computed(() => `Security level: ${this.securityBadgeText()}`);
  complianceText = computed(() => 
    this.mergedConfig().securityProfile?.complianceValidation 
      ? 'This dialog meets industry compliance requirements' 
      : ''
  );

  getStageMarkerClasses(stage: WarningStage): any {
    return {
      active: this.currentStage()?.id === stage.id,
      completed: this.currentStage() ? stage.triggerAtSeconds > this.currentStage()!.triggerAtSeconds : false
    };
  }

  getStagePosition(stage: WarningStage): number {
    const total = this.mergedConfig().warningTimeout;
    return ((total - (stage.triggerAtSeconds * 1000)) / total) * 100;
  }

  getStageStepClasses(stage: WarningStage): any {
    return {
      active: this.currentStage()?.id === stage.id,
      completed: this.currentStage() ? stage.triggerAtSeconds > this.currentStage()!.triggerAtSeconds : false
    };
  }

  getStageStepAriaLabel(stage: WarningStage): string {
    const isActive = this.currentStage()?.id === stage.id;
    const isCompleted = this.currentStage() ? stage.triggerAtSeconds > this.currentStage()!.triggerAtSeconds : false;
    
    if (isActive) return `Current stage: ${stage.name}`;
    if (isCompleted) return `Completed stage: ${stage.name}`;
    return `Upcoming stage: ${stage.name}`;
  }

  isConfirmationValid(): boolean {
    const step = this.currentConfirmationStep();
    if (!step?.requiresInput) return true;
    return this.confirmationInput() === step.expectedInput;
  }

  confirmCloseAction(): void {
    const steps = this.mergedConfig().securityProfile?.closeButton?.confirmationSteps || [];
    const currentIndex = this.confirmationStepIndex();
    
    if (currentIndex < steps.length - 1) {
      // Move to next confirmation step
      this.confirmationStepIndex.set(currentIndex + 1);
      this.confirmationInput.set('');
    } else {
      // Final confirmation - execute close
      this.showingCloseConfirmation.set(false);
      this.executeCloseAction();
    }
  }

  cancelCloseAction(): void {
    this.showingCloseConfirmation.set(false);
    this.confirmationStepIndex.set(0);
    this.confirmationInput.set('');
  }

  // Public API methods for external control
  public showWarning(): void {
    this.isWarningShown.set(true);
  }

  public hideWarning(): void {
    this.isWarningShown.set(false);
  }

  public getCurrentStage(): WarningStage | null {
    return this.currentStage();
  }

  public getSecurityContext(): SecurityContext {
    return { ...this.securityContext };
  }
}