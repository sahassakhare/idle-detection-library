import { Injectable, signal, computed, effect } from '@angular/core';
import { interval, fromEvent, merge, Subject } from 'rxjs';
import { throttleTime, takeUntil } from 'rxjs/operators';

export interface IdleConfig {
  idle: number;
  timeout: number;
  events?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SimpleIdleService {
  private destroy$ = new Subject<void>();
  private idleTimer?: any;
  private warningTimer?: any;
  
  // State signals
  private isIdleSignal = signal(false);
  private isWarningSignal = signal(false);
  private timeRemainingSignal = signal(0);
  private lastActivitySignal = signal(Date.now());
  
  // Public observables
  isIdle$ = computed(() => this.isIdleSignal());
  isWarning$ = computed(() => this.isWarningSignal());
  timeRemaining$ = computed(() => this.timeRemainingSignal());
  lastActivity$ = computed(() => this.lastActivitySignal());
  
  private config: IdleConfig = {
    idle: 10000, // 10 seconds
    timeout: 30000, // 30 seconds
    events: ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
  };
  
  constructor() {
    // Setup activity monitoring
    this.setupActivityMonitoring();
  }
  
  initialize(config: Partial<IdleConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  start() {
    this.resetTimer();
    console.log('Idle detection started');
  }
  
  stop() {
    this.clearTimers();
    this.isIdleSignal.set(false);
    this.isWarningSignal.set(false);
    console.log('Idle detection stopped');
  }
  
  extendSession() {
    console.log('Session extended');
    this.resetTimer();
    this.isWarningSignal.set(false);
    this.isIdleSignal.set(false);
  }
  
  private setupActivityMonitoring() {
    const events$ = merge(
      ...this.config.events!.map(event => 
        fromEvent(document, event).pipe(throttleTime(1000))
      )
    );
    
    events$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isWarningSignal()) {
        this.resetTimer();
      }
    });
  }
  
  private resetTimer() {
    this.clearTimers();
    this.lastActivitySignal.set(Date.now());
    
    this.idleTimer = setTimeout(() => {
      this.onIdle();
    }, this.config.idle);
  }
  
  private clearTimers() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    if (this.warningTimer) {
      clearInterval(this.warningTimer);
    }
  }
  
  private onIdle() {
    console.log('User is idle, showing warning');
    this.isIdleSignal.set(true);
    this.isWarningSignal.set(true);
    
    let remaining = this.config.timeout;
    this.timeRemainingSignal.set(remaining);
    
    this.warningTimer = setInterval(() => {
      remaining -= 1000;
      this.timeRemainingSignal.set(remaining);
      
      if (remaining <= 0) {
        this.onTimeout();
      }
    }, 1000);
  }
  
  private onTimeout() {
    console.log('Session timeout');
    this.clearTimers();
    this.isWarningSignal.set(false);
    // In a real app, trigger logout here
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTimers();
  }
}