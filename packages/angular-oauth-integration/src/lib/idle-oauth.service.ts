import { Injectable, inject, OnDestroy, Inject, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, map, filter, distinctUntilChanged, take } from 'rxjs/operators';
import { Idle, IdleEvent, DEFAULT_INTERRUPTSOURCES } from '@idle-detection/core';
import { IdleOAuthConfig, IdleWarningData } from './types';
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
  private extendSessionCount = 0;
  
  // Use BehaviorSubject for better state management
  private isExtendingSessionSubject = new BehaviorSubject<boolean>(false);
  public readonly isExtendingSession$ = this.isExtendingSessionSubject.asObservable();
  
  private extendSessionTimeout?: number;

  public readonly idleState$ = this.store.select(selectIdleState);
  public readonly isIdle$ = this.store.select(selectIsIdle);
  public readonly isWarning$ = this.store.select(selectIsWarning);
  public readonly timeRemaining$ = this.store.select(selectTimeRemaining);
  public readonly config$ = this.store.select(selectConfig);
  
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
    this.cleanup();
    this.store.dispatch(IdleActions.stopIdleDetection());
    this.idleManager.stop();
  }

  extendSession(): void {
    const timestamp = new Date().toISOString();
    this.extendSessionCount++;
    
    // Prevent multiple concurrent extend session calls
    if (this.isExtendingSessionSubject.value) {
      console.log(`⚠️ [${timestamp}] Extend session already in progress, ignoring...`);
      return;
    }
    
    console.log(`🔄 [${timestamp}] EXTEND SESSION (Attempt #${this.extendSessionCount})...`);
    
    try {
      // Set protection flag
      this.setExtendingSession(true);
      
      // Reset idle manager to trigger proper state change
      console.log('   1. RESET: IdleManager to trigger IDLE_END...');
      this.idleManager.reset();
      
      // Update store state
      console.log('   2. DISPATCH: Reset idle state...');
      this.store.dispatch(IdleActions.resetIdle());
      
      console.log(`✅ [${timestamp}] EXTEND SESSION completed`);
      
    } catch (error) {
      console.error('❌ Error during extend session:', error);
      this.setExtendingSession(false);
    } finally {
      // Safety timeout to clear extending flag
      this.clearExtendSessionTimeout();
      this.extendSessionTimeout = window.setTimeout(() => {
        if (this.isExtendingSessionSubject.value) {
          console.log('🔓 Safety timeout: Clearing extend session flag');
          this.setExtendingSession(false);
        }
      }, 5000);
    }
  }

  private setExtendingSession(value: boolean): void {
    this.isExtendingSessionSubject.next(value);
    console.log(`🔒 Extend session protection: ${value ? 'ACTIVATED' : 'DEACTIVATED'}`);
  }

  private clearExtendSessionTimeout(): void {
    if (this.extendSessionTimeout) {
      clearTimeout(this.extendSessionTimeout);
      this.extendSessionTimeout = undefined;
    }
  }

  private cleanup(): void {
    this.clearExtendSessionTimeout();
    this.setExtendingSession(false);
  }


  logout(): void {
    // Check if we're in the middle of extending session
    if (this.isExtendingSessionSubject.value) {
      console.log('🛡️ Logout blocked - extend session in progress');
      return;
    }
    
    this.cleanup();
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
      console.log(`🚨 TIMEOUT event - isExtendingSession: ${this.isExtendingSessionSubject.value}`);
      
      // Don't logout if extending session
      if (this.isExtendingSessionSubject.value) {
        console.log('🛡️ TIMEOUT blocked - extend session in progress');
        return;
      }
      
      console.log('🚨 TIMEOUT - dispatching logout');
      this.logout();
    });

    this.idleManager.on(IdleEvent.IDLE_END, () => {
      console.log('✅ IDLE_END event');
      this.store.dispatch(IdleActions.resetIdle());
      this.setExtendingSession(false);
    });

    this.idleManager.on(IdleEvent.INTERRUPT, () => {
      console.log('🔄 INTERRUPT event - user activity detected');
      this.store.dispatch(IdleActions.userActivity({ timestamp: Date.now() }));
      this.setExtendingSession(false);
    });
  }
  

  ngOnDestroy(): void {
    console.log('🧹 IdleOAuthService destroying...');
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
    this.idleManager.stop();
    this.isExtendingSessionSubject.complete();
  }
}