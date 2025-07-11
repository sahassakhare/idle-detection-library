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
  private expiryCheckInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor(config: IdleConfig = {}) {
    this.config = {
      idleTimeout: config.idleTimeout || 20 * 60 * 1000, // 20 minutes
      warningTimeout: config.warningTimeout || 5 * 60 * 1000, // 5 minutes
      autoResume: config.autoResume !== false,
      idleName: config.idleName || 'default'
    };
    
    this.state = {
      isIdle: false,
      isWarning: false,
      isTimedOut: false,
      lastActivity: new Date(),
      idleTime: 0
    };
    
    this.initializeEventListeners();
  }
  
  private initializeEventListeners(): void {
    Object.values(IdleEvent).forEach(event => {
      this.listeners.set(event, []);
    });
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
    this.reset();
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
    
    this.reset();
  }
  
  public reset(): void {
    this.state = {
      isIdle: false,
      isWarning: false,
      isTimedOut: false,
      lastActivity: new Date(),
      idleTime: 0
    };
    
    this.clearTimers();
    
    if (this.expiry) {
      this.expiry.clear();
    }
    
    this.emit(IdleEvent.IDLE_END, this.state);
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
    
    if (wasIdle) {
      this.emit(IdleEvent.IDLE_END, this.state);
    }
    
    if (wasWarning) {
      this.emit(IdleEvent.WARNING_END, this.state);
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
    
    if (this.config.warningTimeout > 0) {
      this.startWarningTimer();
    }
    
    if (this.expiry) {
      const expiryTime = new Date(Date.now() + this.config.warningTimeout);
      this.expiry.set(expiryTime);
    }
  }
  
  private startWarningTimer(): void {
    this.warningTimer = setTimeout(() => {
      this.handleWarning();
    }, this.config.warningTimeout);
  }
  
  private handleWarning(): void {
    this.state.isWarning = true;
    this.emit(IdleEvent.WARNING_START, this.state);
    
    setTimeout(() => {
      this.handleTimeout();
    }, 0);
  }
  
  private handleTimeout(): void {
    this.state.isTimedOut = true;
    this.clearTimers();
    
    if (this.expiry) {
      this.expiry.clear();
    }
    
    this.emit(IdleEvent.TIMEOUT, this.state);
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