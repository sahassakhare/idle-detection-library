import { Injectable, inject, OnDestroy, Inject, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, Subject, combineLatest, timer, EMPTY, of, Subscription } from 'rxjs';
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
  private extendSessionCount = 0; // Track extend session attempts for debugging
  private isExtendingSession = false; // CRITICAL: Flag to prevent logout during extend
  private extendSessionTimeout?: number; // Timeout to clear extending flag as fallback

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
    // Clear any existing timeout first
    if (this.extendSessionTimeout) {
      clearTimeout(this.extendSessionTimeout);
      this.extendSessionTimeout = undefined;
    }

    // CRITICAL: Set flag to prevent any logout during extend session
    this.isExtendingSession = true;
    console.log(`🔒 PROTECTION ACTIVATED - isExtendingSession: ${this.isExtendingSession}`);
    
    this.extendSessionCount++;
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] EXTEND SESSION (Attempt #${this.extendSessionCount})...`);
    
    try {
      // 1. RESET: Use IdleManager reset to trigger proper state change
      console.log('   1. RESET: IdleManager to trigger IDLE_END...');
      this.idleManager.reset(); // This should trigger IDLE_END event which clears the flag
      
      // 2. DISPATCH: Reset state in store
      console.log('   2. DISPATCH: Reset idle state...');
      this.store.dispatch(IdleActions.resetIdle());
      
      console.log(`✅ [${timestamp}] EXTEND SESSION completed (Attempt #${this.extendSessionCount})`);
      
    } catch (error) {
      console.error('❌ Error during extend session:', error);
      // Clear flag on error
      this.clearExtendingFlag();
    } finally {
      // Fallback: Clear flag after 5 seconds if events don't fire
      this.extendSessionTimeout = window.setTimeout(() => {
        if (this.isExtendingSession) {
          console.log('⚠️ FALLBACK: Clearing extend session flag after timeout');
          this.clearExtendingFlag();
        }
      }, 5000);
    }
  }

  private clearExtendingFlag(): void {
    if (this.isExtendingSession) {
      this.isExtendingSession = false;
      console.log('🔓 Extend session protection cleared');
    }
    if (this.extendSessionTimeout) {
      clearTimeout(this.extendSessionTimeout);
      this.extendSessionTimeout = undefined;
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

  getCurrentWarningData(): Observable<IdleWarningData> {
    return combineLatest([
      this.timeRemaining$,
      this.config$
    ]).pipe(
      map(([timeRemaining, config]) => ({
        timeRemaining,
        timeRemaining$: this.timeRemaining$,
        onExtendSession: () => this.extendSession(),
        onLogout: () => this.logout(),
        cssClasses: config?.customCssClasses
      })),
      take(1)
    );
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
      // Just dispatch warning state - let the IdleManager handle timing
      this.config$.pipe(take(1)).subscribe(config => {
        this.store.dispatch(IdleActions.startWarning({ timeRemaining: config.warningTimeout }));
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
      this.store.dispatch(IdleActions.resetIdle());
      // Clear extend session protection when idle period ends
      this.clearExtendingFlag();
    });

    this.idleManager.on(IdleEvent.INTERRUPT, () => {
      this.store.dispatch(IdleActions.userActivity({ timestamp: Date.now() }));
      // Clear extend session protection on user activity
      this.clearExtendingFlag();
    });
  }
  

  ngOnDestroy(): void {
    // Clear any pending timeout
    if (this.extendSessionTimeout) {
      clearTimeout(this.extendSessionTimeout);
      this.extendSessionTimeout = undefined;
    }
    
    this.destroy$.next();
    this.destroy$.complete();
    this.idleManager.stop();
  }
}