export interface IdleConfig {
  idleTimeout?: number;
  warningTimeout?: number;
  autoResume?: boolean;
  idleName?: string;
}

export interface IdleState {
  isIdle: boolean;
  isWarning: boolean;
  isTimedOut: boolean;
  lastActivity: Date;
  idleTime: number;
}

export enum IdleEvent {
  IDLE_START = 'idle_start',
  IDLE_END = 'idle_end',
  WARNING_START = 'warning_start',
  WARNING_END = 'warning_end',
  TIMEOUT = 'timeout',
  INTERRUPT = 'interrupt'
}

export interface IdleEventListener {
  (event: IdleEvent, state: IdleState): void;
}

export abstract class InterruptSource {
  protected eventListeners: Array<() => void> = [];
  
  abstract attach(callback: () => void): void;
  abstract detach(): void;
  
  protected cleanup(): void {
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
  }
}

export abstract class IdleExpiry {
  abstract get(): Date | null;
  abstract set(expiry: Date): void;
  abstract clear(): void;
}

export abstract class KeepaliveSvc {
  abstract ping(): void;
  abstract start(): void;
  abstract stop(): void;
  abstract isRunning(): boolean;
}