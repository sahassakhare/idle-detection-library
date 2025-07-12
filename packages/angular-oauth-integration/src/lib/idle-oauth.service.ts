import { Injectable, inject, OnDestroy, Inject, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, Subject, combineLatest, timer, EMPTY } from 'rxjs';
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
    this.store.dispatch(IdleActions.startIdleDetection());
    this.idleManager.watch();
  }

  stop(): void {
    this.store.dispatch(IdleActions.stopIdleDetection());
    this.idleManager.stop();
  }

  extendSession(): void {
    console.log('🔄 Extending session...');
    this.countdownTimer$.next(); // Stop any active countdown
    this.store.dispatch(IdleActions.extendSession());
    this.idleManager.reset(); // Reset the core idle manager
    console.log('✅ Session extended successfully');
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
      this.store.dispatch(IdleActions.startIdle());
    });

    this.idleManager.on(IdleEvent.IDLE_END, () => {
      this.countdownTimer$.next(); // Stop countdown
      this.store.dispatch(IdleActions.resetIdle());
    });

    this.idleManager.on(IdleEvent.INTERRUPT, () => {
      this.countdownTimer$.next(); // Stop countdown
      this.store.dispatch(IdleActions.userActivity({ timestamp: Date.now() }));
    });
  }
  
  private startWarningCountdown(warningTimeout: number): void {
    timer(0, 1000).pipe(
      map(tick => Math.max(0, warningTimeout - (tick * 1000))),
      tap(remaining => {
        if (remaining > 0) {
          this.store.dispatch(IdleActions.updateWarningTime({ timeRemaining: remaining }));
        } else {
          // Time's up - let the core idle manager handle the timeout
          // Don't dispatch startIdle here as it will conflict with the core manager
        }
      }),
      takeUntil(this.countdownTimer$),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleManager.stop();
  }
}