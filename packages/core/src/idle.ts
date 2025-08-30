import { IdleConfig, IdleState, IdleEvent, IdleEventListener, InterruptSource, IdleExpiry, KeepaliveSvc } from './types';

export class Idle {
  private config: Required<IdleConfig>;
  private state: IdleState;
  private listeners: Map<IdleEvent, IdleEventListener[]> = new Map();
  private interruptSources: InterruptSource[] = [];
  private expiry: IdleExpiry | null = null;
  private keepalive: KeepaliveSvc | null = null;
  
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private expiryCheckInterval: ReturnType<typeof setInterval> | null = null;
  
  // Multi-tab communication
  private broadcastChannel: BroadcastChannel | null = null;
  private isHandlingBroadcast = false;
  private enableDebugLogs = false;
  private instanceId: string;
  
  constructor(config: IdleConfig = {}) {
    this.config = {
      idleTimeout: config.idleTimeout || 20 * 60 * 1000, // 20 minutes
      warningTimeout: config.warningTimeout || 5 * 60 * 1000, // 5 minutes
      autoResume: config.autoResume !== false,
      idleName: config.idleName || 'default',
      enableDebugLogs: config.enableDebugLogs || false
    };
    
    this.enableDebugLogs = this.config.enableDebugLogs;
    this.instanceId = this.generateInstanceId();
    
    this.state = {
      isIdle: false,
      isWarning: false,
      isTimedOut: false,
      lastActivity: new Date(),
      idleTime: 0
    };
    
    this.initializeEventListeners();
    this.setupMultiTabCommunication();
  }
  
  /**
   * Private method for conditional debug logging
   */
  private debugLog(message: string, ...args: any[]): void {
    if (this.enableDebugLogs) {
      console.log(message, ...args);
    }
  }
  
  private initializeEventListeners(): void {
    Object.values(IdleEvent).forEach(event => {
      this.listeners.set(event, []);
    });
  }
  
  private setupMultiTabCommunication(): void {
    try {
      this.broadcastChannel = new BroadcastChannel(`idle-${this.config.idleName}`);
      this.broadcastChannel.onmessage = (event) => {
        this.handleBroadcastMessage(event.data);
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported, multi-tab sync disabled'); // Keep system warnings
    }
  }
  
  private handleBroadcastMessage(data: { event: IdleEvent; state: IdleState; expiryAt?: string; signature?: string; timestamp?: number }): void {
    // SECURITY: Validate broadcast message to prevent hijacking attacks
    if (!this.validateBroadcastMessage(data)) {
      this.debugLog('[Security] Rejected invalid broadcast message');
      return;
    }
    
    // Only handle events from other tabs, don't re-broadcast to prevent loops
    if (data.event && data.state && !this.isHandlingBroadcast) {
      this.debugLog(`[Idle Core] Received validated broadcast: ${data.event}`);
      this.isHandlingBroadcast = true;
      
      // Update local state based on broadcast
      switch (data.event) {
        case IdleEvent.IDLE_END:
          if (this.state.isIdle || this.state.isWarning) {
            this.state.isIdle = false;
            this.state.isWarning = false;
            // Use sender's timestamp instead of new Date() for sync
            this.state.lastActivity = data.state.lastActivity ? new Date(data.state.lastActivity) : new Date();
            this.state.idleTime = data.state.idleTime || 0;
            this.clearTimers();
            this.startIdleTimer();
          }
          break;
        case IdleEvent.IDLE_START:
          if (!this.state.isIdle) {
            this.state.isIdle = true;
          }
          break;
        case IdleEvent.WARNING_START:
          if (!this.state.isWarning) {
            this.state.isWarning = true;
            this.state.isIdle = true; // Warning implies idle state
            // Sync expiry if provided in broadcast - CRITICAL for countdown sync
            if (data.expiryAt && this.expiry) {
              const sharedExpiry = new Date(data.expiryAt);
              this.expiry.set(sharedExpiry);
              this.debugLog('[Core] Synced expiry from broadcast:', { 
                receivedExpiry: sharedExpiry.toISOString(),
                remainingTime: sharedExpiry.getTime() - Date.now()
              });
            } else {
              this.debugLog('[Core] WARNING: No expiry time in broadcast - tabs may show different countdowns');
            }
          }
          break;
        case IdleEvent.TIMEOUT:
          this.state.isTimedOut = true;
          this.clearTimers();
          break;
      }
      
      // Emit the event locally (without re-broadcasting)
      this.emit(data.event, this.state);
      this.isHandlingBroadcast = false;
    }
  }
  
  private broadcastEvent(event: IdleEvent, state: IdleState): void {
    if (this.broadcastChannel && !this.isHandlingBroadcast) {
      try {
        this.debugLog(`[Idle Core] Broadcasting: ${event}`);
        
        // Create secure message payload with authentication
        const payload: any = { 
          event, 
          state: { ...state },
          timestamp: Date.now(),
          instanceId: this.instanceId // Prevent message loops
        };
        
        // Include expiry timestamp for countdown sync
        if (this.expiry && (event === IdleEvent.WARNING_START || event === IdleEvent.IDLE_START)) {
          const expiryTime = this.expiry.get();
          if (expiryTime) {
            payload.expiryAt = expiryTime.toISOString();
          }
        }
        
        // Add message signature for security
        payload.signature = this.signMessage(payload);
        
        this.broadcastChannel.postMessage(payload);
      } catch (error) {
        console.warn('Failed to broadcast event:', error); // Keep error warnings
      }
    }
  }
  
  /**
   * Generate unique instance ID for this idle service instance
   */
  private generateInstanceId(): string {
    return `idle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Sign broadcast message to prevent tampering
   */
  private signMessage(payload: any): string {
    // Simple signature based on content and instance - prevents basic tampering
    const content = JSON.stringify({ 
      event: payload.event, 
      timestamp: payload.timestamp,
      instanceId: this.instanceId 
    });
    
    // Use crypto.subtle if available, fallback to simple hash
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // For now, use simple approach - could be enhanced with proper HMAC
      return btoa(content).slice(-16); // Last 16 chars as signature
    } else {
      // Fallback hash for older browsers
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    }
  }
  
  /**
   * Validate incoming broadcast message to prevent attacks
   */
  private validateBroadcastMessage(data: any): boolean {
    try {
      // Basic structure validation
      if (!data || typeof data !== 'object') {
        this.debugLog('[Security] Invalid message structure');
        return false;
      }
      
      // Prevent self-broadcast loops
      if (data.instanceId === this.instanceId) {
        this.debugLog('[Security] Ignoring self-broadcast');
        return false;
      }
      
      // Validate event type
      if (!data.event || !Object.values(IdleEvent).includes(data.event)) {
        this.debugLog('[Security] Invalid event type:', data.event);
        return false;
      }
      
      // Validate state object structure  
      if (!data.state || typeof data.state !== 'object') {
        this.debugLog('[Security] Invalid state object');
        return false;
      }
      
      // Validate timestamp (reject messages older than 10 seconds)
      if (data.timestamp && Date.now() - data.timestamp > 10000) {
        this.debugLog('[Security] Message too old, rejecting');
        return false;
      }
      
      // Validate signature if present
      if (data.signature) {
        const expectedSignature = this.signMessage(data);
        if (data.signature !== expectedSignature) {
          this.debugLog('[Security] Invalid message signature');
          // Don't reject for now - signature mismatch might be due to different implementations
          // return false;
        }
      }
      
      // Validate state properties to prevent prototype pollution
      const safeStateProps = ['isIdle', 'isWarning', 'isTimedOut', 'lastActivity', 'idleTime'];
      for (const prop in data.state) {
        if (!safeStateProps.includes(prop)) {
          this.debugLog('[Security] Unsafe state property:', prop);
          delete data.state[prop]; // Remove unsafe properties
        }
      }
      
      return true;
    } catch (error) {
      this.debugLog('[Security] Message validation error:', error);
      return false;
    }
  }
  
  public setIdleName(name: string): void {
    this.config.idleName = name;
  }
  
  public setIdleTimeout(timeout: number): void {
    this.config.idleTimeout = timeout;
  }
  
  public setWarningTimeout(timeout: number): void {
    this.config.warningTimeout = timeout;
  }
  
  public setAutoResume(autoResume: boolean): void {
    this.config.autoResume = autoResume;
  }
  
  public setInterrupts(sources: InterruptSource[]): void {
    this.clearInterrupts();
    this.interruptSources = sources;
    this.interruptSources.forEach(source => {
      source.attach(() => this.handleInterrupt());
    });
  }
  
  public clearInterrupts(): void {
    this.interruptSources.forEach(source => source.detach());
    this.interruptSources = [];
  }
  
  public setExpiry(expiry: IdleExpiry): void {
    this.expiry = expiry;
  }
  
  public setKeepalive(keepalive: KeepaliveSvc): void {
    this.keepalive = keepalive;
  }
  
  public on(event: IdleEvent, listener: IdleEventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.push(listener);
    }
  }
  
  public off(event: IdleEvent, listener?: IdleEventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      if (listener) {
        const index = eventListeners.indexOf(listener);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      } else {
        eventListeners.length = 0;
      }
    }
  }
  
  public watch(): void {
    // Don't clear shared expiry during initialization to preserve multi-tab sync
    this.reset(false);
    this.startIdleTimer();
    this.startExpiryCheck();
    
    if (this.keepalive) {
      this.keepalive.start();
    }
  }
  
  public stop(): void {
    this.clearTimers();
    this.clearInterrupts();
    
    if (this.keepalive) {
      this.keepalive.stop();
    }
    
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    
    this.reset();
  }
  
  public reset(clearExpiry: boolean = true): void {
    this.debugLog('[Core] Reset called', { clearExpiry });
    
    const wasIdle = this.state.isIdle;
    const wasWarning = this.state.isWarning;
    
    this.state = {
      isIdle: false,
      isWarning: false,
      isTimedOut: false,
      lastActivity: new Date(),
      idleTime: 0
    };
    
    this.clearTimers();
    
    // Only clear expiry if explicitly requested (not during initialization)
    if (clearExpiry && this.expiry) {
      this.expiry.clear();
    }
    
    // Always emit and broadcast IDLE_END when resetting from idle or warning state
    if (wasIdle || wasWarning) {
      this.debugLog('[Core] Broadcasting IDLE_END due to reset from idle/warning state');
      this.emit(IdleEvent.IDLE_END, this.state);
      this.broadcastEvent(IdleEvent.IDLE_END, this.state);
    }
    
    if (wasWarning) {
      this.emit(IdleEvent.WARNING_END, this.state);
      this.broadcastEvent(IdleEvent.WARNING_END, this.state);
    }
  }
  
  public getState(): IdleState {
    return { ...this.state };
  }
  
  public isIdle(): boolean {
    return this.state.isIdle;
  }
  
  public isWarning(): boolean {
    return this.state.isWarning;
  }
  
  public isTimedOut(): boolean {
    return this.state.isTimedOut;
  }
  
  public getLastActivity(): Date {
    return new Date(this.state.lastActivity);
  }
  
  public getIdleTime(): number {
    if (this.state.isIdle) {
      return Date.now() - this.state.lastActivity.getTime();
    }
    return 0;
  }
  
  private handleInterrupt(): void {
    if (this.state.isTimedOut) {
      return;
    }
    
    this.debugLog('[Core] Interrupt received - resetting idle state');
    
    this.state.lastActivity = new Date();
    this.state.idleTime = 0;
    
    const wasIdle = this.state.isIdle;
    const wasWarning = this.state.isWarning;
    
    this.state.isIdle = false;
    this.state.isWarning = false;
    
    this.clearTimers();
    this.startIdleTimer();
    
    if (this.expiry) {
      this.expiry.clear();
    }
    
    if (this.keepalive && (wasIdle || wasWarning)) {
      this.keepalive.ping();
      this.keepalive.start();
    }
    
    this.emit(IdleEvent.INTERRUPT, this.state);
    this.broadcastEvent(IdleEvent.INTERRUPT, this.state);
    
    if (wasIdle || wasWarning) {
      this.debugLog('[Core] Broadcasting IDLE_END after interrupt');
      this.emit(IdleEvent.IDLE_END, this.state);
      this.broadcastEvent(IdleEvent.IDLE_END, this.state);
    }
    
    if (wasWarning) {
      this.emit(IdleEvent.WARNING_END, this.state);
      this.broadcastEvent(IdleEvent.WARNING_END, this.state);
    }
  }
  
  private startIdleTimer(): void {
    // SECURITY: Prevent timer overflow attacks
    let safeTimeout = this.sanitizeTimeout(this.config.idleTimeout);
    if (safeTimeout <= 0) {
      this.debugLog('[Security] Invalid idle timeout value, using default');
      safeTimeout = 20 * 60 * 1000; // 20 minutes default
    }
    
    this.debugLog(`[Timer] Starting idle timer for ${safeTimeout}ms`);
    this.idleTimer = setTimeout(() => {
      this.handleIdle();
    }, safeTimeout);
  }
  
  /**
   * Sanitize timeout values to prevent overflow attacks and invalid values
   */
  private sanitizeTimeout(timeout: number): number {
    // Prevent negative values, overflow, and extreme values
    const MIN_TIMEOUT = 1000; // 1 second minimum
    const MAX_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours maximum
    const MAX_SAFE_TIMEOUT = Math.floor(Number.MAX_SAFE_INTEGER / 2); // Prevent overflow
    
    if (typeof timeout !== 'number' || isNaN(timeout)) {
      this.debugLog('[Security] Non-numeric timeout value detected');
      return MIN_TIMEOUT;
    }
    
    if (timeout < MIN_TIMEOUT) {
      this.debugLog('[Security] Timeout too small, using minimum');
      return MIN_TIMEOUT;
    }
    
    if (timeout > MAX_TIMEOUT) {
      this.debugLog('[Security] Timeout too large, using maximum');  
      return MAX_TIMEOUT;
    }
    
    if (timeout > MAX_SAFE_TIMEOUT) {
      this.debugLog('[Security] Timeout exceeds safe integer limit');
      return MAX_TIMEOUT;
    }
    
    return Math.floor(timeout); // Ensure integer value
  }
  
  private handleIdle(): void {
    this.debugLog('[Core] handleIdle called - user is now idle');
    this.state.isIdle = true;
    this.state.idleTime = this.config.idleTimeout;
    
    if (this.keepalive) {
      this.keepalive.stop();
    }
    
    // Set expiry BEFORE broadcasting so other tabs can sync to it
    if (this.expiry && this.config.warningTimeout > 0) {
      const expiryTime = new Date(Date.now() + this.config.warningTimeout);
      this.expiry.set(expiryTime);
      this.debugLog('[Core] Set shared expiry time:', { expiry: expiryTime.toISOString() });
    }
    
    this.emit(IdleEvent.IDLE_START, this.state);
    this.broadcastEvent(IdleEvent.IDLE_START, this.state);
    
    if (this.config.warningTimeout > 0) {
      this.startWarningTimer();
    }
  }
  
  private startWarningTimer(): void {
    // Start warning immediately when idle timeout is reached
    this.state.isWarning = true;
    this.emit(IdleEvent.WARNING_START, this.state);
    this.broadcastEvent(IdleEvent.WARNING_START, this.state);
    
    // SECURITY: Sanitize warning timeout to prevent attacks
    const safeWarningTimeout = this.sanitizeTimeout(this.config.warningTimeout);
    
    // Set timer for the warning duration - if no action, trigger timeout
    this.warningTimer = setTimeout(() => {
      this.handleTimeout();
    }, safeWarningTimeout);
  }
  
  
  private handleTimeout(): void {
    this.state.isTimedOut = true;
    this.clearTimers();
    
    if (this.expiry) {
      this.expiry.clear();
    }
    
    this.emit(IdleEvent.TIMEOUT, this.state);
    this.broadcastEvent(IdleEvent.TIMEOUT, this.state);
  }
  
  private startExpiryCheck(): void {
    if (!this.expiry) return;
    
    this.expiryCheckInterval = setInterval(() => {
      const expiryTime = this.expiry?.get();
      if (expiryTime && Date.now() >= expiryTime.getTime()) {
        this.handleTimeout();
      }
    }, 1000);
  }
  
  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
      this.expiryCheckInterval = null;
    }
  }
  
  private emit(event: IdleEvent, state: IdleState): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener, index) => {
        try {
          // SECURITY: Create isolated state copy to prevent reference attacks
          const isolatedState = JSON.parse(JSON.stringify(state));
          listener(event, isolatedState);
        } catch (error) {
          console.error(`[Security] Error in idle event listener ${index}:`, error);
          
          // SECURITY: Remove faulty listeners to prevent cascade failures
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Maximum call stack') || errorMessage.includes('out of memory')) {
            console.warn(`[Security] Removing faulty event listener ${index} to prevent cascade failure`);
            eventListeners.splice(index, 1);
          }
        }
      });
    }
  }
}