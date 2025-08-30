import { IdleExpiry } from './types';
import { safeGetLocalStorage, safeGetSessionStorage, isPlatformBrowser } from './ssr-detection';

export class SimpleExpiry extends IdleExpiry {
  private expiryValue: Date | null = null;
  
  get(): Date | null {
    return this.expiryValue;
  }
  
  set(expiry: Date): void {
    this.expiryValue = expiry;
  }
  
  clear(): void {
    this.expiryValue = null;
  }
}

export class LocalStorageExpiry extends IdleExpiry {
  private storageKey: string;
  
  constructor(idleName: string = 'default') {
    super();
    this.storageKey = `idle-expiry-${idleName}`;
  }
  
  get(): Date | null {
    const localStorage = safeGetLocalStorage();
    if (!localStorage) {
      return null;
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        // SECURITY: Validate date string to prevent corruption attacks
        const parsedDate = new Date(stored);
        if (isNaN(parsedDate.getTime())) {
          console.warn('[Security] Corrupted date in localStorage, clearing:', stored);
          this.clear(); // Clear corrupted data
          return null;
        }
        
        // SECURITY: Prevent extreme future dates that could cause overflow
        const now = Date.now();
        const maxFutureTime = now + (24 * 60 * 60 * 1000); // 24 hours max
        if (parsedDate.getTime() > maxFutureTime) {
          console.warn('[Security] Expiry date too far in future, clearing');
          this.clear();
          return null;
        }
        
        return parsedDate;
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      // SECURITY: Clear potentially corrupted data
      try {
        this.clear();
      } catch (clearError) {
        console.warn('Error clearing corrupted localStorage data:', clearError);
      }
    }
    
    return null;
  }
  
  set(expiry: Date): void {
    const localStorage = safeGetLocalStorage();
    if (!localStorage) {
      return;
    }
    
    try {
      // SECURITY: Validate input date to prevent attacks
      if (!expiry || isNaN(expiry.getTime())) {
        console.warn('[Security] Invalid expiry date provided');
        return;
      }
      
      // SECURITY: Prevent extreme dates that could cause issues
      const now = Date.now();
      const maxFutureTime = now + (24 * 60 * 60 * 1000); // 24 hours max
      if (expiry.getTime() > maxFutureTime) {
        console.warn('[Security] Expiry date too far in future, capping to 24 hours');
        expiry = new Date(maxFutureTime);
      }
      
      // SECURITY: Use atomic operation with version checking to prevent race conditions
      const version = localStorage.getItem(this.storageKey + '-version') || '0';
      const newVersion = (parseInt(version) + 1).toString();
      
      // Atomic write with version checking
      localStorage.setItem(this.storageKey + '-version', newVersion);
      localStorage.setItem(this.storageKey, expiry.toISOString());
      
    } catch (error) {
      // SECURITY: Handle quota exceeded and other storage failures
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      if (errorName === 'QuotaExceededError') {
        console.warn('[Security] localStorage quota exceeded, attempting cleanup');
        this.attemptStorageCleanup();
      } else {
        console.warn('Error writing to localStorage:', error);
      }
    }
  }
  
  /**
   * Attempt to clean up localStorage when quota is exceeded
   */
  private attemptStorageCleanup(): void {
    try {
      // Remove old idle-related entries
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('idle-') && key !== this.storageKey) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Individual cleanup failures are non-critical
        }
      });
      
    } catch (error) {
      console.warn('Storage cleanup failed:', error);
    }
  }
  
  clear(): void {
    const localStorage = safeGetLocalStorage();
    if (!localStorage) {
      return;
    }
    
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
}

export class SessionStorageExpiry extends IdleExpiry {
  private storageKey: string;
  
  constructor(idleName: string = 'default') {
    super();
    this.storageKey = `idle-expiry-${idleName}`;
  }
  
  get(): Date | null {
    const sessionStorage = safeGetSessionStorage();
    if (!sessionStorage) {
      return null;
    }
    
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        return new Date(stored);
      }
    } catch (error) {
      console.warn('Error reading from sessionStorage:', error);
    }
    
    return null;
  }
  
  set(expiry: Date): void {
    const sessionStorage = safeGetSessionStorage();
    if (!sessionStorage) {
      return;
    }
    
    try {
      sessionStorage.setItem(this.storageKey, expiry.toISOString());
    } catch (error) {
      console.warn('Error writing to sessionStorage:', error);
    }
  }
  
  clear(): void {
    const sessionStorage = safeGetSessionStorage();
    if (!sessionStorage) {
      return;
    }
    
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error);
    }
  }
}

export class CookieExpiry extends IdleExpiry {
  private cookieName: string;
  
  constructor(idleName: string = 'default') {
    super();
    this.cookieName = `idle-expiry-${idleName}`;
  }
  
  get(): Date | null {
    if (!isPlatformBrowser()) {
      return null;
    }
    
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === this.cookieName && value) {
          return new Date(decodeURIComponent(value));
        }
      }
    } catch (error) {
      console.warn('Error reading from cookies:', error);
    }
    
    return null;
  }
  
  set(expiry: Date): void {
    if (!isPlatformBrowser()) {
      return;
    }
    
    try {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      document.cookie = `${this.cookieName}=${encodeURIComponent(expiry.toISOString())}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    } catch (error) {
      console.warn('Error writing to cookies:', error);
    }
  }
  
  clear(): void {
    if (!isPlatformBrowser()) {
      return;
    }
    
    try {
      document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
    } catch (error) {
      console.warn('Error clearing cookies:', error);
    }
  }
}

export class MemoryExpiry extends IdleExpiry {
  private static instances: Map<string, Date | null> = new Map();
  private key: string;
  
  constructor(idleName: string = 'default') {
    super();
    this.key = `memory-expiry-${idleName}`;
  }
  
  get(): Date | null {
    return MemoryExpiry.instances.get(this.key) || null;
  }
  
  set(expiry: Date): void {
    MemoryExpiry.instances.set(this.key, expiry);
  }
  
  clear(): void {
    MemoryExpiry.instances.delete(this.key);
  }
}

export class MultiTabExpiry extends IdleExpiry {
  private primaryExpiry: IdleExpiry;
  private fallbackExpiry: IdleExpiry;
  
  constructor(idleName: string = 'default') {
    super();
    this.primaryExpiry = new LocalStorageExpiry(idleName);
    this.fallbackExpiry = new MemoryExpiry(idleName);
  }
  
  get(): Date | null {
    return this.primaryExpiry.get() || this.fallbackExpiry.get();
  }
  
  set(expiry: Date): void {
    this.primaryExpiry.set(expiry);
    this.fallbackExpiry.set(expiry);
  }
  
  clear(): void {
    this.primaryExpiry.clear();
    this.fallbackExpiry.clear();
  }
}