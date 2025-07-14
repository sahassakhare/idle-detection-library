import { Injectable, inject, OnDestroy, Inject, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, Subject, combineLatest, timer, EMPTY, of } from 'rxjs';
import { takeUntil, map, filter, distinctUntilChanged, take, switchMap, tap } from 'rxjs/operators';
import { Idle, IdleEvent, DEFAULT_INTERRUPTSOURCES } from '@idle-detection/core';
import { IdleOAuthConfig, IdleState, IdleStatus, IdleWarningData } from './types';
import { IDLE_OAUTH_CONFIG } from './providers';
import * as IdleActions from './store/idle.actions';
import { 
  selectIdleState, 
  selectIsIdle, 
  selectIsWarning, 
  selectTimeRemaining,
  selectConfig,
  selectIdleStatus
} from './store/idle.selectors';

@Injectable({
  providedIn: 'root'
})
export class IdleOAuthService implements OnDestroy {
  private store = inject(Store);
  private oidcSecurityService = inject(OidcSecurityService);
  private destroy$ = new Subject<void>();
  private idleManager: Idle;
  private countdownTimer$ = new Subject<void>();
  private extendSessionCount = 0; // Track extend session attempts for debugging
  private isExtendingSession = false; // CRITICAL: Flag to prevent logout during extend

  public readonly idleState$ = this.store.select(selectIdleState);
  public readonly isIdle$ = this.store.select(selectIsIdle);
  public readonly isWarning$ = this.store.select(selectIsWarning);
  public readonly timeRemaining$ = this.store.select(selectTimeRemaining);
  public readonly config$ = this.store.select(selectConfig);
  
  // CRITICAL: Expose extend session flag for NgRx effects
  public get isExtendingSession$() {
    return of(this.isExtendingSession);
  }
  public readonly idleStatus$ = this.store.select(selectIdleStatus);

  constructor(
    @Optional() @Inject(IDLE_OAUTH_CONFIG) private config: IdleOAuthConfig | null
  ) {
    this.idleManager = new Idle();
    this.setupAuthenticationWatcher();
    
    if (this.config) {
      this.initialize(this.config);
    }
  }

  initialize(config: IdleOAuthConfig): void {
    this.store.dispatch(IdleActions.initializeIdle({ config }));
    
    if (config.configUrl) {
      this.store.dispatch(IdleActions.loadExternalConfig({ configUrl: config.configUrl }));
    }

    // Configure idle manager with timeouts
    this.idleManager.setIdleTimeout(config.idleTimeout);
    this.idleManager.setWarningTimeout(config.warningTimeout);
    
    // Set up interrupt sources
    this.idleManager.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.setupIdleDetection();
  }

  start(): void {
    console.log('🚀 Starting idle detection...');
    // Ensure clean start by stopping any existing detection
    this.idleManager.stop();
    this.store.dispatch(IdleActions.startIdleDetection());
    this.idleManager.watch();
  }

  stop(): void {
    console.log('🛑 Stopping idle detection...');
    this.countdownTimer$.next(); // Stop any active countdown
    this.store.dispatch(IdleActions.stopIdleDetection());
    this.idleManager.stop();
  }

  extendSession(): void {
    // CRITICAL: Set flag to prevent any logout during extend session
    this.isExtendingSession = true;
    console.log(`🔒 PROTECTION ACTIVATED - isExtendingSession: ${this.isExtendingSession}`);
    
    this.extendSessionCount++;
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] EXTEND SESSION (Attempt #${this.extendSessionCount})...`);
    
    try {
      // 1. IMMEDIATE: Stop countdown and reset warning state  
      console.log('   1. EMERGENCY STOP: All timers and warning state...');
      this.countdownTimer$.next(); // Stop countdown timer
      this.store.dispatch(IdleActions.resetIdle()); // Reset state FIRST
      
      // 2. AGGRESSIVE: Multiple stop calls to ensure IdleManager is truly stopped
      console.log('   2. AGGRESSIVE STOP: IdleManager...');
      this.idleManager.stop(); // First stop
      this.idleManager.stop(); // Second stop for safety
      
      // 3. FORCE: Clear any existing timeouts/intervals in IdleManager
      console.log('   3. FORCE CLEAR: All internal timers...');
      // Force stop by reconfiguring with very long timeouts temporarily
      this.idleManager.setIdleTimeout(999999999);
      this.idleManager.setWarningTimeout(999999999);
      
      // 4. Wait for everything to clear, then reconfigure properly
      console.log('   4. DELAY: Ensuring clean state...');
      setTimeout(() => {
        console.log('   5. RECONFIGURE: Fresh idle manager settings...');
        this.reconfigureIdleManagerSync();
        
        console.log('   6. RESTART: Fresh idle detection cycle...');
        this.idleManager.watch();
        
        console.log(`✅ [${timestamp}] EXTEND SESSION completed (Attempt #${this.extendSessionCount})`);
      }, 100); // Small delay to ensure cleanup
      
    } catch (error) {
      console.error('❌ Error during extend session:', error);
    } finally {
      // CRITICAL: Don't clear flag on timer - only clear when warning actually stops
      // The flag will be cleared when IDLE_END event fires or user activity detected
      console.log('⏳ Protection flag will remain active until warning period ends');
    }
  }

  private reconfigureIdleManager(): void {
    // Get current configuration and ensure it's applied
    this.config$.pipe(take(1)).subscribe(config => {
      console.log('🔧 Reconfiguring idle manager with timeouts:', {
        idle: config.idleTimeout,
        warning: config.warningTimeout
      });
      
      // Ensure timeouts are properly set
      this.idleManager.setIdleTimeout(config.idleTimeout);
      this.idleManager.setWarningTimeout(config.warningTimeout);
      
      // Reconfigure interrupt sources to ensure clean setup
      this.idleManager.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    });
  }

  private reconfigureIdleManagerSync(): void {
    // CRITICAL FIX: Synchronous reconfiguration for extend session
    // Get current config synchronously from the store
    let currentConfig: any = null;
    this.config$.pipe(take(1)).subscribe(config => {
      currentConfig = config;
    });

    if (currentConfig) {
      console.log('🔧 Reconfiguring idle manager SYNCHRONOUSLY with timeouts:', {
        idle: currentConfig.idleTimeout,
        warning: currentConfig.warningTimeout
      });
      
      // Ensure timeouts are properly set
      this.idleManager.setIdleTimeout(currentConfig.idleTimeout);
      this.idleManager.setWarningTimeout(currentConfig.warningTimeout);
      
      // Reconfigure interrupt sources to ensure clean setup
      this.idleManager.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    } else {
      console.error('❌ Could not get current config for synchronous reconfiguration');
    }
  }

  logout(): void {
    this.store.dispatch(IdleActions.logout());
  }

  updateConfig(config: Partial<IdleOAuthConfig>): void {
    this.store.dispatch(IdleActions.updateConfig({ config }));
  }

  setUserRole(role: string): void {
    this.store.dispatch(IdleActions.setUserRole({ role }));
  }

  getWarningData(): Observable<IdleWarningData> {
    return combineLatest([
      this.timeRemaining$,
      this.config$
    ]).pipe(
      map(([timeRemaining, config]) => ({
        timeRemaining,
        timeRemaining$: this.timeRemaining$,
        onExtendSession: () => this.extendSession(),
        onLogout: () => this.logout(),
        cssClasses: config.customCssClasses
      }))
    );
  }

  getCurrentWarningData(): IdleWarningData | null {
    let currentTimeRemaining = 0;
    let currentConfig: any = null;
    
    this.timeRemaining$.pipe(take(1)).subscribe(time => currentTimeRemaining = time);
    this.config$.pipe(take(1)).subscribe(config => currentConfig = config);
    
    return {
      timeRemaining: currentTimeRemaining,
      timeRemaining$: this.timeRemaining$,
      onExtendSession: () => this.extendSession(),
      onLogout: () => this.logout(),
      cssClasses: currentConfig?.customCssClasses
    };
  }

  private setupAuthenticationWatcher(): void {
    this.oidcSecurityService.isAuthenticated$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(({ isAuthenticated }) => {
        if (isAuthenticated) {
          this.start();
        } else {
          this.stop();
        }
      });

    this.oidcSecurityService.userData$
      .pipe(
        filter(userData => !!userData),
        map(userData => {
          const userDataAny = userData as any;
          return userDataAny?.role || userDataAny?.userRole || userDataAny?.roles?.[0] || 'default';
        }),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(role => {
        this.setUserRole(role);
      });
  }

  private setupIdleDetection(): void {
    this.idleManager.on(IdleEvent.IDLE_START, () => {
      // Start warning with proper countdown
      this.config$.pipe(take(1)).subscribe(config => {
        this.store.dispatch(IdleActions.startWarning({ timeRemaining: config.warningTimeout }));
        this.startWarningCountdown(config.warningTimeout);
      });
    });

    this.idleManager.on(IdleEvent.TIMEOUT, () => {
      // CRITICAL: Don't trigger logout if we're in the middle of extending session
      console.log(`🔍 TIMEOUT event fired - isExtendingSession: ${this.isExtendingSession}`);
      if (this.isExtendingSession) {
        console.log('🛡️ TIMEOUT blocked - extend session in progress');
        return;
      }
      console.log('🚨 TIMEOUT - dispatching startIdle action');
      this.store.dispatch(IdleActions.startIdle());
    });

    this.idleManager.on(IdleEvent.IDLE_END, () => {
      this.countdownTimer$.next(); // Stop countdown
      this.store.dispatch(IdleActions.resetIdle());
      // Clear extend session protection when idle period ends
      if (this.isExtendingSession) {
        this.isExtendingSession = false;
        console.log('🔓 Extend session protection cleared - idle period ended');
      }
    });

    this.idleManager.on(IdleEvent.INTERRUPT, () => {
      this.countdownTimer$.next(); // Stop countdown
      this.store.dispatch(IdleActions.userActivity({ timestamp: Date.now() }));
      // Clear extend session protection on user activity
      if (this.isExtendingSession) {
        this.isExtendingSession = false;
        console.log('🔓 Extend session protection cleared - user activity detected');
      }
    });
  }
  
  private startWarningCountdown(warningTimeout: number): void {
    console.log(`🔔 Starting warning countdown: ${warningTimeout}ms (${Math.floor(warningTimeout / 1000)}s)`);
    
    // CRITICAL FIX: Ensure any existing countdown is stopped first
    this.countdownTimer$.next();
    
    // Add a small delay to ensure the previous timer is fully stopped
    setTimeout(() => {
      timer(0, 1000).pipe(
        map(tick => Math.max(0, warningTimeout - (tick * 1000))),
        tap(remaining => {
          console.log(`⏱️ Warning countdown: ${Math.floor(remaining / 1000)}s remaining`);
          if (remaining > 0) {
            this.store.dispatch(IdleActions.updateWarningTime({ timeRemaining: remaining }));
          } else {
            console.log('⏰ Warning countdown complete - letting core manager handle timeout');
            // Time's up - let the core idle manager handle the timeout
            // Don't dispatch startIdle here as it will conflict with the core manager
          }
        }),
        takeUntil(this.countdownTimer$),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {}, // Timer tick
        complete: () => console.log('🔕 Warning countdown stopped'),
        error: (err) => console.error('❌ Warning countdown error:', err)
      });
    }, 10); // Small delay to ensure previous timer cleanup
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleManager.stop();
  }
}