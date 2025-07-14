# Angular OAuth Integration - API Reference

## Table of Contents

- [Services](#services)
- [Components](#components)
- [NgRx Integration](#ngrx-integration)
- [Types and Interfaces](#types-and-interfaces)
- [Guards and Interceptors](#guards-and-interceptors)
- [Utilities](#utilities)

## Services

### IdleOAuthService

The main service for managing idle detection with OAuth integration.

#### Properties

##### Observable Properties

```typescript
// State observables
readonly idleStatus$: Observable<IdleStatus>
readonly isIdle$: Observable<boolean>
readonly isWarning$: Observable<boolean>
readonly isDetecting$: Observable<boolean>
readonly timeRemaining$: Observable<number>
readonly lastActivity$: Observable<number>
readonly config$: Observable<IdleOAuthConfig>
readonly error$: Observable<any>
```

#### Methods

##### Configuration Methods

###### `initialize(config)`

Initializes the service with configuration.

```typescript
initialize(config: IdleOAuthConfig): void
```

**Parameters:**
- `config`: Configuration object

**Example:**
```typescript
this.idleOAuthService.initialize({
  idleTimeout: 1800000,      // 30 minutes
  warningTimeout: 300000,    // 5 minutes
  autoRefreshToken: true,
  multiTabCoordination: true
});
```

**Events Triggered:**
- Dispatches `initializeIdle` action to NgRx store

---

###### `updateConfig(config)`

Updates the current configuration.

```typescript
updateConfig(config: Partial<IdleOAuthConfig>): void
```

**Parameters:**
- `config`: Partial configuration object with properties to update

**Example:**
```typescript
this.idleOAuthService.updateConfig({
  idleTimeout: 2400000,  // Update to 40 minutes
  debug: true           // Enable debug mode
});
```

**Events Triggered:**
- Dispatches `updateConfig` action to NgRx store

##### Control Methods

###### `start()`

Starts idle detection monitoring.

```typescript
start(): void
```

**Example:**
```typescript
this.idleOAuthService.start();
console.log('Idle detection started');
```

**Events Triggered:**
- Dispatches `startIdleDetection` action
- Begins monitoring user activity

---

###### `stop()`

Stops idle detection monitoring.

```typescript
stop(): void
```

**Example:**
```typescript
ngOnDestroy(): void {
  this.idleOAuthService.stop();
}
```

**Events Triggered:**
- Dispatches `stopIdleDetection` action
- Cleans up all timers and listeners

---

###### `reset()`

Resets the idle timer.

```typescript
reset(): void
```

**Example:**
```typescript
// Reset on custom user interaction
onUserAction(): void {
  this.idleOAuthService.reset();
}
```

**Events Triggered:**
- Dispatches `userActivity` action with current timestamp

##### Session Management Methods

###### `extendSession()`

Extends the user session and resets idle detection.

```typescript
extendSession(): void
```

**Example:**
```typescript
onExtendSession(): void {
  this.idleOAuthService.extendSession();
  this.hideWarningDialog();
}
```

**Internal Process:**
1. Sets protection flag to prevent logout
2. Stops all timers and countdown
3. Reconfigures idle manager
4. Restarts fresh detection cycle
5. Clears protection flag when safe

---

###### `logout()`

Performs logout and stops idle detection.

```typescript
logout(): void
```

**Example:**
```typescript
onLogout(): void {
  this.idleOAuthService.logout();
  this.router.navigate(['/login']);
}
```

**Events Triggered:**
- Dispatches `logout` action
- Stops idle detection
- Clears all timers

##### Data Access Methods

###### `getCurrentWarningData()`

Gets current warning data synchronously.

```typescript
getCurrentWarningData(): IdleWarningData | null
```

**Returns:** Warning data object or `null` if not in warning state

**Example:**
```typescript
ngOnInit(): void {
  this.idleService.isWarning$.subscribe(isWarning => {
    if (isWarning) {
      this.warningData = this.idleService.getCurrentWarningData();
    }
  });
}
```

---

###### `getWarningData()`

Gets warning data as an observable.

```typescript
getWarningData(): Observable<IdleWarningData>
```

**Returns:** Observable of warning data

**Example:**
```typescript
ngOnInit(): void {
  this.warningData$ = this.idleService.getWarningData();
}
```

#### Usage Examples

##### Basic Service Usage

```typescript
@Component({...})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor(private idleService: IdleOAuthService) {}

  ngOnInit(): void {
    // Initialize
    this.idleService.initialize({
      idleTimeout: 900000,
      warningTimeout: 180000,
      autoRefreshToken: true
    });

    // Start monitoring
    this.idleService.start();

    // Subscribe to state changes
    this.idleService.idleStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.handleStatusChange(status);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleService.stop();
  }
}
```

##### Advanced Configuration

```typescript
ngOnInit(): void {
  this.idleService.initialize({
    idleTimeout: 1800000,
    warningTimeout: 300000,
    autoRefreshToken: true,
    refreshThreshold: 600000,
    multiTabCoordination: true,
    customCssClasses: {
      dialog: 'custom-warning-dialog',
      title: 'warning-title',
      message: 'warning-message'
    },
    debug: environment.production ? false : true
  });
}
```

## Components

### IdleWarningDialogComponent

Customizable warning dialog component.

#### Selector

```typescript
'idle-warning-dialog'
```

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `warningData` | `IdleWarningData` | **Required** | Warning data from service |
| `titleText` | `string` | `'Session Warning'` | Dialog title text |
| `messageText` | `string` | `'Your session is about to expire...'` | Warning message |
| `extendText` | `string` | `'Extend Session'` | Extend button text |
| `logoutText` | `string` | `'Logout'` | Logout button text |
| `extendLabel` | `string` | `'Extend your session'` | Extend button aria-label |
| `logoutLabel` | `string` | `'Logout and end session'` | Logout button aria-label |
| `theme` | `'default' \| 'dark' \| 'minimal'` | `'default'` | Visual theme |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Dialog size |
| `showProgressBar` | `boolean` | `true` | Show countdown progress bar |
| `showCountdown` | `boolean` | `true` | Show time remaining text |
| `autoClose` | `boolean` | `false` | Auto-close when time expires |
| `backdropClose` | `boolean` | `false` | Allow backdrop click to close |
| `customStyles` | `Record<string, string>` | `{}` | Custom CSS styles |
| `dialogClass` | `string` | `'idle-warning-dialog'` | Custom CSS class |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `extendSession` | `EventEmitter<void>` | Emitted when extend button clicked |
| `logout` | `EventEmitter<void>` | Emitted when logout button clicked |

#### Usage Examples

##### Basic Usage

```typescript
@Component({
  template: `
    <idle-warning-dialog 
      *ngIf="showWarning"
      [warningData]="warningData"
      (extendSession)="onExtendSession()"
      (logout)="onLogout()">
    </idle-warning-dialog>
  `
})
export class AppComponent {
  showWarning = false;
  warningData: IdleWarningData;

  onExtendSession(): void {
    this.idleService.extendSession();
    this.showWarning = false;
  }

  onLogout(): void {
    this.idleService.logout();
    this.showWarning = false;
  }
}
```

##### Customized Dialog

```typescript
@Component({
  template: `
    <idle-warning-dialog 
      *ngIf="showWarning"
      [warningData]="warningData"
      theme="dark"
      size="large"
      titleText="🔒 Security Alert"
      messageText="Your session will expire in {{timeRemaining}} seconds for security."
      extendText="Continue Session"
      logoutText="Secure Logout"
      [showProgressBar]="true"
      [showCountdown]="true"
      [customStyles]="{
        'border-radius': '16px',
        'box-shadow': '0 24px 48px rgba(0,0,0,0.4)'
      }"
      (extendSession)="extendSession()"
      (logout)="secureLogout()">
    </idle-warning-dialog>
  `
})
export class SecureAppComponent {
  // Component implementation
}
```

##### Responsive Dialog

```typescript
@Component({
  template: `
    <idle-warning-dialog 
      *ngIf="showWarning"
      [warningData]="warningData"
      [theme]="isMobile ? 'minimal' : 'default'"
      [size]="isMobile ? 'small' : 'medium'"
      [showProgressBar]="!isMobile"
      (extendSession)="extendSession()"
      (logout)="logout()">
    </idle-warning-dialog>
  `
})
export class ResponsiveAppComponent {
  isMobile = window.innerWidth < 768;

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isMobile = event.target.innerWidth < 768;
  }
}
```

#### Accessibility

The component includes comprehensive accessibility features:

- **ARIA Labels**: All interactive elements have appropriate labels
- **Keyboard Navigation**: Full keyboard support with proper tab order
- **Screen Reader Support**: Announcements for time updates and state changes
- **High Contrast**: Support for high contrast themes
- **Focus Management**: Proper focus trapping within dialog

```typescript
// Accessibility features
@Component({
  template: `
    <div 
      class="idle-warning-dialog"
      role="dialog"
      [attr.aria-labelledby]="dialogTitleId"
      [attr.aria-describedby]="dialogMessageId"
      aria-modal="true">
      
      <h2 [id]="dialogTitleId">{{ displayTitle() }}</h2>
      <p [id]="dialogMessageId">{{ displayMessage() }}</p>
      
      <button 
        [attr.aria-label]="extendLabel"
        (click)="onExtendSession()">
        {{ displayExtendLabel() }}
      </button>
    </div>
  `
})
```

## NgRx Integration

### State Interface

```typescript
interface IdleState {
  status: IdleStatus;
  isDetecting: boolean;
  timeRemaining: number;
  config: IdleOAuthConfig | null;
  lastActivity: number;
  isExtendingSession: boolean;
  multiTabActive: boolean;
  error: string | null;
}
```

### Actions

#### Configuration Actions

```typescript
// Initialize idle detection
const initializeIdle = createAction(
  '[Idle] Initialize',
  props<{ config: IdleOAuthConfig }>()
);

// Update configuration
const updateConfig = createAction(
  '[Idle] Update Config',
  props<{ config: Partial<IdleOAuthConfig> }>()
);
```

#### Control Actions

```typescript
// Start/stop detection
const startIdleDetection = createAction('[Idle] Start Detection');
const stopIdleDetection = createAction('[Idle] Stop Detection');

// User activity
const userActivity = createAction(
  '[Idle] User Activity',
  props<{ timestamp: number }>()
);

// Reset idle timer
const resetIdle = createAction('[Idle] Reset Idle');
```

#### Session Actions

```typescript
// Warning state
const startWarning = createAction(
  '[Idle] Start Warning',
  props<{ timeRemaining: number }>()
);

const updateWarningTime = createAction(
  '[Idle] Update Warning Time',
  props<{ timeRemaining: number }>()
);

// Session management
const extendSession = createAction('[Idle] Extend Session');
const logout = createAction('[Idle] Logout');

// Idle state
const startIdle = createAction('[Idle] Start Idle');
```

#### Multi-Tab Actions

```typescript
// Multi-tab coordination
const handleTabMessage = createAction(
  '[Idle] Handle Tab Message',
  props<{ message: TabCoordinationMessage }>()
);

const setMultiTabActive = createAction(
  '[Idle] Set Multi Tab Active',
  props<{ active: boolean }>()
);
```

### Selectors

```typescript
// Feature selector
const selectIdleFeature = createFeatureSelector<IdleState>('idle');

// Basic selectors
const selectIdleStatus = createSelector(
  selectIdleFeature,
  state => state.status
);

const selectIsIdle = createSelector(
  selectIdleStatus,
  status => status === IdleStatus.IDLE
);

const selectIsWarning = createSelector(
  selectIdleStatus,
  status => status === IdleStatus.WARNING
);

const selectTimeRemaining = createSelector(
  selectIdleFeature,
  state => state.timeRemaining
);

const selectIsDetecting = createSelector(
  selectIdleFeature,
  state => state.isDetecting
);

const selectLastActivity = createSelector(
  selectIdleFeature,
  state => state.lastActivity
);

const selectConfig = createSelector(
  selectIdleFeature,
  state => state.config
);

const selectError = createSelector(
  selectIdleFeature,
  state => state.error
);
```

#### Usage in Components

```typescript
@Component({...})
export class IdleStatusComponent {
  idleStatus$ = this.store.select(selectIdleStatus);
  timeRemaining$ = this.store.select(selectTimeRemaining);
  isDetecting$ = this.store.select(selectIsDetecting);

  constructor(private store: Store) {}
}
```

### Effects

The library includes comprehensive effects for handling:

#### OAuth Token Management

```typescript
@Injectable()
export class IdleEffects {
  // Auto-refresh tokens before expiry
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.refreshToken),
      switchMap(() => 
        this.oauthService.refreshToken().pipe(
          map(() => IdleActions.refreshTokenSuccess()),
          catchError(error => of(IdleActions.refreshTokenFailure({ error })))
        )
      )
    )
  );
}
```

#### Multi-Tab Coordination

```typescript
// Handle messages from other tabs
handleTabMessage$ = createEffect(() =>
  this.actions$.pipe(
    ofType(IdleActions.handleTabMessage),
    tap(({ message }) => {
      this.multiTabService.handleMessage(message);
    })
  ), { dispatch: false }
);
```

#### Session Management

```typescript
// Handle session extension
extendSession$ = createEffect(() =>
  this.actions$.pipe(
    ofType(IdleActions.extendSession),
    tap(() => {
      console.log('Session extended via NgRx effect');
    })
  ), { dispatch: false }
);
```

## Types and Interfaces

### Core Types

#### IdleOAuthConfig

Main configuration interface.

```typescript
interface IdleOAuthConfig {
  // Timeout settings
  idleTimeout: number;              // Time until idle (ms)
  warningTimeout: number;           // Warning period (ms)
  
  // OAuth settings
  autoRefreshToken?: boolean;       // Auto refresh tokens
  refreshThreshold?: number;        // Refresh threshold (ms)
  
  // Coordination
  multiTabCoordination?: boolean;   // Multi-tab sync
  
  // UI customization
  customCssClasses?: {
    dialog?: string;
    title?: string;
    message?: string;
    buttons?: string;
  };
  
  // Debug
  debug?: boolean;
}
```

#### IdleWarningData

Warning dialog data structure.

```typescript
interface IdleWarningData {
  timeRemaining: number;                    // Current time remaining
  timeRemaining$: Observable<number>;       // Reactive time remaining
  onExtendSession: () => void;             // Extend session callback
  onLogout: () => void;                    // Logout callback
  cssClasses?: {                           // Custom CSS classes
    dialog?: string;
    title?: string;
    message?: string;
    buttons?: string;
  };
}
```

#### IdleStatus

Enumeration of idle states.

```typescript
enum IdleStatus {
  ACTIVE = 'active',      // User is active
  WARNING = 'warning',    // Warning period
  IDLE = 'idle'          // User is idle
}
```

### Advanced Types

#### TabCoordinationMessage

Message structure for multi-tab communication.

```typescript
interface TabCoordinationMessage {
  type: 'idle' | 'active' | 'warning' | 'extend' | 'logout';
  tabId: string;
  timestamp: number;
  data?: {
    timeRemaining?: number;
    config?: Partial<IdleOAuthConfig>;
  };
}
```

#### IdleEvent

Event data structure for activity tracking.

```typescript
interface IdleEvent {
  type: string;
  timestamp: number;
  target?: HTMLElement;
  coordinates?: {
    x: number;
    y: number;
  };
}
```

## Guards and Interceptors

### IdleGuard

Route guard to protect routes based on idle state.

```typescript
@Injectable({
  providedIn: 'root'
})
export class IdleGuard implements CanActivate, CanActivateChild {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectIsIdle).pipe(
      map(isIdle => {
        if (isIdle) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }

  canActivateChild(): Observable<boolean> {
    return this.canActivate();
  }
}
```

#### Usage

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [IdleGuard]
  },
  {
    path: 'admin',
    canActivateChild: [IdleGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent }
    ]
  }
];
```

### IdleActivityInterceptor

HTTP interceptor for detecting activity from API calls.

```typescript
@Injectable()
export class IdleActivityInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(
    req: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Record activity on outgoing requests
    this.store.dispatch(IdleActions.userActivity({ 
      timestamp: Date.now() 
    }));

    return next.handle(req).pipe(
      tap(() => {
        // Record activity on successful responses
        this.store.dispatch(IdleActions.userActivity({ 
          timestamp: Date.now() 
        }));
      })
    );
  }
}
```

#### Registration

```typescript
// app.config.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig = {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IdleActivityInterceptor,
      multi: true
    }
  ]
};
```

### Advanced Guard Examples

#### Role-Based Idle Guard

```typescript
@Injectable()
export class RoleBasedIdleGuard implements CanActivate {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRole = route.data['role'];
    
    return combineLatest([
      this.store.select(selectIsIdle),
      this.authService.getCurrentUserRole()
    ]).pipe(
      map(([isIdle, userRole]) => {
        if (isIdle) {
          this.router.navigate(['/login']);
          return false;
        }
        
        if (requiredRole && userRole !== requiredRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
        
        return true;
      })
    );
  }
}
```

## Utilities

### Time Formatting

Utility functions for formatting time values.

```typescript
// Format milliseconds to human-readable string
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Format for accessibility
export function formatTimeForA11y(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minutes and ${seconds} seconds`;
  }
  return `${seconds} seconds`;
}
```

#### Usage

```typescript
@Component({
  template: `
    <p>Time remaining: {{ timeRemaining$ | async | timeFormat }}</p>
    <span [attr.aria-label]="(timeRemaining$ | async | timeFormatA11y) + ' remaining'">
      {{ timeRemaining$ | async | timeFormat }}
    </span>
  `
})
export class TimeDisplayComponent {
  timeRemaining$ = this.idleService.timeRemaining$;
}
```

### Storage Utilities

Utilities for managing idle state persistence.

```typescript
export class IdleStorageService {
  private readonly STORAGE_KEY = 'idle-detection-state';

  saveState(state: Partial<IdleState>): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Failed to save idle state:', error);
    }
  }

  loadState(): Partial<IdleState> | null {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.warn('Failed to load idle state:', error);
      return null;
    }
  }

  clearState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

### Configuration Validation

Utility for validating configuration objects.

```typescript
export function validateIdleConfig(config: IdleOAuthConfig): string[] {
  const errors: string[] = [];

  if (config.idleTimeout <= 0) {
    errors.push('idleTimeout must be greater than 0');
  }

  if (config.warningTimeout <= 0) {
    errors.push('warningTimeout must be greater than 0');
  }

  if (config.warningTimeout >= config.idleTimeout) {
    errors.push('warningTimeout must be less than idleTimeout');
  }

  if (config.refreshThreshold && config.refreshThreshold <= 0) {
    errors.push('refreshThreshold must be greater than 0');
  }

  return errors;
}
```

#### Usage

```typescript
ngOnInit(): void {
  const config: IdleOAuthConfig = {
    idleTimeout: 1800000,
    warningTimeout: 300000,
    autoRefreshToken: true
  };

  const errors = validateIdleConfig(config);
  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    return;
  }

  this.idleService.initialize(config);
}
```

---

## Testing Utilities

### Mock Services

```typescript
export class MockIdleOAuthService {
  private statusSubject = new BehaviorSubject<IdleStatus>(IdleStatus.ACTIVE);
  private warningSubject = new BehaviorSubject<boolean>(false);
  
  idleStatus$ = this.statusSubject.asObservable();
  isWarning$ = this.warningSubject.asObservable();
  isIdle$ = this.idleStatus$.pipe(map(status => status === IdleStatus.IDLE));
  
  initialize(config: IdleOAuthConfig): void {
    // Mock implementation
  }
  
  start(): void {
    this.statusSubject.next(IdleStatus.ACTIVE);
  }
  
  extendSession(): void {
    this.statusSubject.next(IdleStatus.ACTIVE);
    this.warningSubject.next(false);
  }
  
  triggerWarning(): void {
    this.statusSubject.next(IdleStatus.WARNING);
    this.warningSubject.next(true);
  }
  
  triggerIdle(): void {
    this.statusSubject.next(IdleStatus.IDLE);
    this.warningSubject.next(false);
  }
}
```

### Test Helpers

```typescript
export class IdleTestingHelper {
  static createMockWarningData(): IdleWarningData {
    return {
      timeRemaining: 120000,
      timeRemaining$: of(120000),
      onExtendSession: jasmine.createSpy('onExtendSession'),
      onLogout: jasmine.createSpy('onLogout')
    };
  }
  
  static createMockConfig(): IdleOAuthConfig {
    return {
      idleTimeout: 300000,
      warningTimeout: 60000,
      autoRefreshToken: true,
      multiTabCoordination: false,
      debug: false
    };
  }
}
```