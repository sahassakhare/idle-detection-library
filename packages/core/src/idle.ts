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
  
  constructor(config: IdleConfig = {}) {
    this.config = {
      idleTimeout: config.idleTimeout || 20 * 60 * 1000, // 20 minutes
      warningTimeout: config.warningTimeout || 5 * 60 * 1000, // 5 minutes
      autoResume: config.autoResume !== false,
      idleName: config.idleName || 'default',
      enableDebugLogs: config.enableDebugLogs || false
    };
    
    this.enableDebugLogs = this.config.enableDebugLogs;
    
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
  
  private handleBroadcastMessage(data: { event: IdleEvent; state: IdleState; expiryAt?: string }): void {
    // Only handle events from other tabs, don't re-broadcast to prevent loops
    if (data.event && data.state && !this.isHandlingBroadcast) {
      this.debugLog(`[Idle Core] Received broadcast: ${data.event}`);
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
            // Sync expiry if provided in broadcast
            if (data.expiryAt && this.expiry) {
              const sharedExpiry = new Date(data.expiryAt);
              this.expiry.set(sharedExpiry);
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
        // Include expiry timestamp for countdown sync
        const payload: any = { event, state: { ...state } };
        if (this.expiry && (event === IdleEvent.WARNING_START || event === IdleEvent.IDLE_START)) {
          const expiryTime = this.expiry.get();
          if (expiryTime) {
            payload.expiryAt = expiryTime.toISOString();
          }
        }
        this.broadcastChannel.postMessage(payload);
      } catch (error) {
        console.warn('Failed to broadcast event:', error); // Keep error warnings
      }
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
    this.idleTimer = setTimeout(() => {
      this.handleIdle();
    }, this.config.idleTimeout);
  }
  
  private handleIdle(): void {
    this.state.isIdle = true;
    this.state.idleTime = this.config.idleTimeout;
    
    if (this.keepalive) {
      this.keepalive.stop();
    }
    
    this.emit(IdleEvent.IDLE_START, this.state);
    this.broadcastEvent(IdleEvent.IDLE_START, this.state);
    
    if (this.config.warningTimeout > 0) {
      this.startWarningTimer();
    }
    
    if (this.expiry) {
      const expiryTime = new Date(Date.now() + this.config.warningTimeout);
      this.expiry.set(expiryTime);
    }
  }
  
  private startWarningTimer(): void {
    // Start warning immediately when idle timeout is reached
    this.state.isWarning = true;
    this.emit(IdleEvent.WARNING_START, this.state);
    this.broadcastEvent(IdleEvent.WARNING_START, this.state);
    
    // Set timer for the warning duration - if no action, trigger timeout
    this.warningTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.config.warningTimeout);
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
      eventListeners.forEach(listener => {
        try {
          listener(event, { ...state });
        } catch (error) {
          console.error('Error in idle event listener:', error);
        }
      });
    }
  }
}