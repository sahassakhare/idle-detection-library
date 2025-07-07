export function isPlatformBrowser(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof window.document !== 'undefined';
}

export function isPlatformServer(): boolean {
  return !isPlatformBrowser();
}

export function getGlobalThis(): typeof globalThis {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof window !== 'undefined') {
    return window as any;
  }
  if (typeof global !== 'undefined') {
    return global as any;
  }
  if (typeof self !== 'undefined') {
    return self as any;
  }
  throw new Error('Unable to locate global object');
}

export function safeGetDocument(): Document | null {
  return isPlatformBrowser() ? document : null;
}

export function safeGetWindow(): Window | null {
  return isPlatformBrowser() ? window : null;
}

export function safeGetLocalStorage(): Storage | null {
  try {
    return isPlatformBrowser() && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function safeGetSessionStorage(): Storage | null {
  try {
    return isPlatformBrowser() && window.sessionStorage ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export class SSRCompatibleEventTarget {
  private listeners: Map<string, Array<(event: Event) => void>> = new Map();
  
  addEventListener(type: string, listener: (event: Event) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }
  
  removeEventListener(type: string, listener: (event: Event) => void): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.indexOf(listener);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    }
  }
  
  dispatchEvent(event: Event): boolean {
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
      return true;
    }
    return false;
  }
}

export function createSSRSafeEventTarget(): EventTarget {
  return isPlatformBrowser() ? new EventTarget() : new SSRCompatibleEventTarget() as any;
}

export function createSSRSafeTimer(callback: () => void, delay: number): NodeJS.Timeout | number {
  if (isPlatformBrowser()) {
    return setTimeout(callback, delay);
  } else {
    return setTimeout(callback, delay);
  }
}

export function clearSSRSafeTimer(timerId: NodeJS.Timeout | number): void {
  clearTimeout(timerId as any);
}

export function createSSRSafeInterval(callback: () => void, delay: number): NodeJS.Timeout | number {
  if (isPlatformBrowser()) {
    return setInterval(callback, delay);
  } else {
    return setInterval(callback, delay);
  }
}

export function clearSSRSafeInterval(intervalId: NodeJS.Timeout | number): void {
  clearInterval(intervalId as any);
}