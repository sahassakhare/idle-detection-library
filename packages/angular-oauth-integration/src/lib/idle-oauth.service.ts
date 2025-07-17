import { Injectable, inject, OnDestroy, Inject, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, Subject, combineLatest } from 'rxjs';
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
  
  // Simple flag-based approach - no complex timing
  private blockLogoutUntil = 0; // Timestamp until which logout should be blocked

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

    // Configure idle manager
    this.idleManager.setIdleTimeout(config.idleTimeout);
    this.idleManager.setWarningTimeout(config.warningTimeout);
    this.idleManager.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.setupIdleDetection();
  }

  start(): void {
    console.log('🚀 Starting idle detection...');
    this.store.dispatch(IdleActions.startIdleDetection());
    this.idleManager.watch();
  }

  stop(): void {
    console.log('🛑 Stopping idle detection...');
    this.store.dispatch(IdleActions.stopIdleDetection());
    this.idleManager.stop();
  }

  extendSession(): void {
    const now = Date.now();
    console.log(`🔄 [${new Date().toISOString()}] EXTEND SESSION - blocking logout for 30 seconds`);
    
    // Block logout for 30 seconds from now
    this.blockLogoutUntil = now + 30000;
    
    // Reset the idle manager - let it handle its own lifecycle
    this.idleManager.reset();
    
    // Update store
    this.store.dispatch(IdleActions.resetIdle());
    
    console.log(`✅ Session extended - logout blocked until ${new Date(this.blockLogoutUntil).toISOString()}`);
  }

  logout(): void {
    const now = Date.now();
    
    if (now < this.blockLogoutUntil) {
      console.log(`🛡️ Logout blocked - ${Math.ceil((this.blockLogoutUntil - now) / 1000)}s remaining`);
      return;
    }
    
    console.log('🚪 Performing logout...');
    this.store.dispatch(IdleActions.logout());
  }

  updateConfig(config: Partial<IdleOAuthConfig>): void {
    this.store.dispatch(IdleActions.updateConfig({ config }));
  }

  setUserRole(role: string): void {
    this.store.dispatch(IdleActions.setUserRole({ role }));
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
    // IDLE_START - show warning dialog
    this.idleManager.on(IdleEvent.IDLE_START, () => {
      console.log('⚠️ IDLE_START - showing warning');
      this.config$.pipe(take(1)).subscribe(config => {
        this.store.dispatch(IdleActions.startWarning({ timeRemaining: config.warningTimeout }));
      });
    });

    // TIMEOUT - try to logout (will be blocked if extend session was recent)
    this.idleManager.on(IdleEvent.TIMEOUT, () => {
      console.log('🚨 TIMEOUT - attempting logout');
      this.logout(); // This method now handles the blocking logic
    });

    // IDLE_END - reset state
    this.idleManager.on(IdleEvent.IDLE_END, () => {
      console.log('✅ IDLE_END - resetting state');
      this.store.dispatch(IdleActions.resetIdle());
    });

    // INTERRUPT - user activity
    this.idleManager.on(IdleEvent.INTERRUPT, () => {
      console.log('🔄 INTERRUPT - user activity');
      this.store.dispatch(IdleActions.userActivity({ timestamp: Date.now() }));
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 Destroying IdleOAuthService...');
    this.destroy$.next();
    this.destroy$.complete();
    this.idleManager.stop();
  }
}