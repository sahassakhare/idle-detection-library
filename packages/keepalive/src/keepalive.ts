import { KeepaliveSvc } from '@idle-detection/core';

export interface KeepaliveConfig {
  interval?: number;
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'HEAD';
  headers?: Record<string, string>;
  body?: string | object;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onPing?: () => void;
  onFailure?: (error: Error) => void;
  onSuccess?: (response: Response) => void;
}

export class HttpKeepalive extends KeepaliveSvc {
  private config: Required<KeepaliveConfig>;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastPingTime: Date | null = null;
  
  constructor(config: KeepaliveConfig) {
    super();
    this.config = {
      interval: config.interval || 5 * 60 * 1000, // 5 minutes
      url: config.url || '/keepalive',
      method: config.method || 'GET',
      headers: config.headers || {},
      body: config.body || '',
      timeout: config.timeout || 30000, // 30 seconds
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      onPing: config.onPing || (() => {}),
      onFailure: config.onFailure || (() => {}),
      onSuccess: config.onSuccess || (() => {})
    };
  }
  
  start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.scheduleNextPing();
  }
  
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
  
  ping(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.lastPingTime = new Date();
    this.config.onPing();
    
    this.performPing()
      .then(response => {
        this.config.onSuccess(response);
      })
      .catch(error => {
        this.config.onFailure(error);
      });
  }
  
  isRunning(): boolean {
    return this.isRunning;
  }
  
  getLastPingTime(): Date | null {
    return this.lastPingTime;
  }
  
  setInterval(interval: number): void {
    this.config.interval = interval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
  
  setUrl(url: string): void {
    this.config.url = url;
  }
  
  setHeaders(headers: Record<string, string>): void {
    this.config.headers = headers;
  }
  
  private scheduleNextPing(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.intervalId = setTimeout(() => {
      this.ping();
      this.scheduleNextPing();
    }, this.config.interval);
  }
  
  private async performPing(): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const requestOptions: RequestInit = {
        method: this.config.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers
        },
        signal: controller.signal
      };
      
      if (this.config.method !== 'GET' && this.config.body) {
        requestOptions.body = typeof this.config.body === 'string' 
          ? this.config.body 
          : JSON.stringify(this.config.body);
      }
      
      const response = await this.retryFetch(this.config.url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  private async retryFetch(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await fetch(url, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }
    
    throw lastError;
  }
}

export class WebSocketKeepalive extends KeepaliveSvc {
  private websocket: WebSocket | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastPingTime: Date | null = null;
  private config: {
    url: string;
    interval: number;
    pingMessage: string;
    onPing: () => void;
    onFailure: (error: Error) => void;
    onSuccess: () => void;
  };
  
  constructor(config: {
    url: string;
    interval?: number;
    pingMessage?: string;
    onPing?: () => void;
    onFailure?: (error: Error) => void;
    onSuccess?: () => void;
  }) {
    super();
    this.config = {
      url: config.url,
      interval: config.interval || 5 * 60 * 1000,
      pingMessage: config.pingMessage || 'ping',
      onPing: config.onPing || (() => {}),
      onFailure: config.onFailure || (() => {}),
      onSuccess: config.onSuccess || (() => {})
    };
  }
  
  start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.connect();
  }
  
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
  
  ping(): void {
    if (!this.isRunning || !this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    this.lastPingTime = new Date();
    this.config.onPing();
    
    try {
      this.websocket.send(this.config.pingMessage);
      this.config.onSuccess();
    } catch (error) {
      this.config.onFailure(error instanceof Error ? error : new Error('WebSocket send failed'));
    }
  }
  
  isRunning(): boolean {
    return this.isRunning;
  }
  
  private connect(): void {
    if (typeof WebSocket === 'undefined') {
      this.config.onFailure(new Error('WebSocket not supported'));
      return;
    }
    
    try {
      this.websocket = new WebSocket(this.config.url);
      
      this.websocket.onopen = () => {
        this.startPingInterval();
      };
      
      this.websocket.onclose = () => {
        if (this.isRunning) {
          setTimeout(() => this.connect(), 5000); // Reconnect after 5 seconds
        }
      };
      
      this.websocket.onerror = (error) => {
        this.config.onFailure(new Error('WebSocket error'));
      };
    } catch (error) {
      this.config.onFailure(error instanceof Error ? error : new Error('WebSocket connection failed'));
    }
  }
  
  private startPingInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.config.interval);
  }
}

export class CustomKeepalive extends KeepaliveSvc {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  constructor(
    private pingFn: () => void | Promise<void>,
    private interval: number = 5 * 60 * 1000
  ) {
    super();
  }
  
  start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.interval);
  }
  
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  ping(): void {
    if (!this.isRunning) {
      return;
    }
    
    try {
      const result = this.pingFn();
      if (result instanceof Promise) {
        result.catch(error => {
          console.error('Keepalive ping failed:', error);
        });
      }
    } catch (error) {
      console.error('Keepalive ping failed:', error);
    }
  }
  
  isRunning(): boolean {
    return this.isRunning;
  }
  
  setInterval(interval: number): void {
    this.interval = interval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}