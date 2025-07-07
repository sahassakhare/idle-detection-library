import { Injectable, Inject, Optional, OnDestroy } from '@angular/core';
import { 
  Idle, 
  IdleEvent, 
  DEFAULT_INTERRUPTSOURCES, 
  LocalStorageExpiry,
  isPlatformBrowser 
} from '@idle-detection/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IDLE_OAUTH_CONFIG, AngularIdleOAuthConfig, DEFAULT_IDLE_OAUTH_CONFIG } from './types';
import * as IdleActions from './store/idle.actions';
import * as IdleSelectors from './store/idle.selectors';
import { IdleState } from './store/idle.state';

export interface IdleStateView {
  isIdle: boolean;
  isWarning: boolean;
  isTimedOut: boolean;
  lastActivity: Date;
  remainingTime?: number;
}

@Injectable()
export class IdleOAuthService implements OnDestroy {
  private idle!: Idle;
  private config: AngularIdleOAuthConfig;

  // NgRx Store selectors as observables (initialized in constructor)
  public state$: Observable<IdleStateView>;
  public isIdle$: Observable<boolean>;
  public isWarning$: Observable<boolean>;
  public warning$: Observable<boolean>; // Alias for compatibility
  public isTimedOut$: Observable<boolean>;
  public showWarning$: Observable<boolean>;
  public remainingTime$: Observable<number>;
  public sessionStatus$: Observable<string>;

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private store: Store,
    @Optional() @Inject(IDLE_OAUTH_CONFIG) config?: AngularIdleOAuthConfig
  ) {
    this.config = { ...DEFAULT_IDLE_OAUTH_CONFIG, ...config };
    
    // Initialize NgRx Store selectors
    this.state$ = this.store.select(IdleSelectors.selectCurrentState);
    this.isIdle$ = this.store.select(IdleSelectors.selectIsIdle);
    this.isWarning$ = this.store.select(IdleSelectors.selectIsWarning);
    this.warning$ = this.store.select(IdleSelectors.selectIsWarning); // Alias for compatibility
    this.isTimedOut$ = this.store.select(IdleSelectors.selectIsTimedOut);
    this.showWarning$ = this.store.select(IdleSelectors.selectShowWarning);
    this.remainingTime$ = this.store.select(IdleSelectors.selectRemainingTime);
    this.sessionStatus$ = this.store.select(IdleSelectors.selectSessionStatus);
    
    if (isPlatformBrowser()) {
      this.initializeIdleDetection();
    }
  }

  private initializeIdleDetection(): void {
    this.idle = new Idle({
      idleTimeout: this.config.idleTimeout,
      warningTimeout: this.config.warningTimeout,
      autoResume: this.config.autoResume,
      idleName: this.config.idleName || 'oauth-idle'
    });

    // Set up interrupt sources
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // Set up multi-tab coordination if enabled
    if (this.config.multiTabCoordination) {
      this.idle.setExpiry(new LocalStorageExpiry(this.config.multiTabStorageKey));
    }

    // Set up event handlers
    this.setupEventHandlers();

    this.log('Idle detection initialized');
  }

  private setupEventHandlers(): void {
    this.idle.on(IdleEvent.IDLE_START, () => {
      this.log('User went idle');
      this.store.dispatch(IdleActions.idleStarted());
    });

    this.idle.on(IdleEvent.WARNING_START, () => {
      this.log('Warning phase started');
      const remainingTime = Math.floor(this.config.warningTimeout! / 1000);
      this.store.dispatch(IdleActions.warningStarted({ remainingTime }));
    });

    this.idle.on(IdleEvent.INTERRUPT, () => {
      this.log('User activity detected');
      this.store.dispatch(IdleActions.userActivity());
    });

    this.idle.on(IdleEvent.TIMEOUT, () => {
      this.log('User timed out');
      this.store.dispatch(IdleActions.timeout());
    });
  }


  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[IdleOAuthService] ${message}`, ...args);
    }
  }

  /**
   * Start monitoring for idle activity
   */
  public startWatching(): void {
    if (!isPlatformBrowser()) {
      return;
    }
    
    this.idle.watch();
    this.store.dispatch(IdleActions.startWatching());
    this.log('Started watching for idle activity');
  }

  /**
   * Stop monitoring for idle activity
   */
  public stopWatching(): void {
    if (!isPlatformBrowser()) {
      return;
    }
    
    this.idle.stop();
    this.store.dispatch(IdleActions.stopWatching());
    this.log('Stopped watching for idle activity');
  }

  /**
   * Reset idle timer (mark user as active)
   */
  public resetIdle(): void {
    if (!isPlatformBrowser()) {
      return;
    }
    
    this.idle.reset();
    this.store.dispatch(IdleActions.resetIdle());
    this.log('Idle timer reset');
  }

  /**
   * Get current idle state
   */
  public getCurrentState(): Observable<IdleStateView> {
    return this.state$;
  }

  /**
   * Check if user is currently idle
   */
  public isUserIdle(): Observable<boolean> {
    return this.isIdle$;
  }

  /**
   * Check if user is in warning state
   */
  public isUserInWarning(): Observable<boolean> {
    return this.isWarning$;
  }

  /**
   * Check if user has timed out
   */
  public isUserTimedOut(): Observable<boolean> {
    return this.isTimedOut$;
  }

  /**
   * Extend the session (same as resetIdle)
   */
  public extendSession(): void {
    this.resetIdle();
  }

  /**
   * Manually logout user
   */
  public logoutNow(): void {
    this.stopWatching();
    this.store.dispatch(IdleActions.logoutRequest());
    
    if (this.config.timeoutRedirectUrl) {
      window.location.href = this.config.timeoutRedirectUrl;
    }
  }

  ngOnDestroy(): void {
    this.stopWatching();
  }
}