import { InterruptSource } from './types';
import { isPlatformBrowser, safeGetDocument, safeGetWindow } from './ssr-detection';

export class EventTargetInterruptSource extends InterruptSource {
  private isAttached = false;
  
  constructor(
    private target: EventTarget,
    private events: string
  ) {
    super();
  }
  
  attach(callback: () => void): void {
    if (this.isAttached) {
      this.detach();
    }
    
    if (isPlatformBrowser()) {
      const eventTypes = this.events.split(' ').filter(e => e.trim());
      
      eventTypes.forEach(eventType => {
        const listener = () => callback();
        this.target.addEventListener(eventType, listener, { passive: true });
        
        this.eventListeners.push(() => {
          this.target.removeEventListener(eventType, listener);
        });
      });
      
      this.isAttached = true;
    }
  }
  
  detach(): void {
    if (this.isAttached) {
      this.cleanup();
      this.isAttached = false;
    }
  }
  
}

export class DocumentInterruptSource extends EventTargetInterruptSource {
  constructor(events: string = 'keydown keyup keypress mousedown mouseup mousemove touchstart touchend touchmove scroll wheel') {
    const document = safeGetDocument();
    super(document ? document.documentElement : {} as EventTarget, events);
  }
}

export class WindowInterruptSource extends EventTargetInterruptSource {
  constructor(events: string = 'focus blur resize') {
    const window = safeGetWindow();
    super(window ? window : {} as EventTarget, events);
  }
}

export class StorageInterruptSource extends EventTargetInterruptSource {
  constructor() {
    const window = safeGetWindow();
    super(window ? window : {} as EventTarget, 'storage');
  }
}

export const DEFAULT_INTERRUPTSOURCES = [
  new DocumentInterruptSource(),
  new WindowInterruptSource(),
  new StorageInterruptSource()
];

export class CustomInterruptSource extends InterruptSource {
  private isAttached = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(
    private checkFn: () => boolean,
    private interval: number = 1000
  ) {
    super();
  }
  
  attach(callback: () => void): void {
    if (this.isAttached) {
      this.detach();
    }
    
    this.intervalId = setInterval(() => {
      if (this.checkFn()) {
        callback();
      }
    }, this.interval);
    
    this.isAttached = true;
  }
  
  detach(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isAttached = false;
  }
}

export class ElementInterruptSource extends EventTargetInterruptSource {
  constructor(element: HTMLElement, events: string = 'keydown keyup keypress mousedown mouseup mousemove touchstart touchend touchmove') {
    super(element, events);
  }
}

export class MediaInterruptSource extends InterruptSource {
  private isAttached = false;
  private mediaElements: HTMLMediaElement[] = [];
  
  constructor(mediaSelector: string = 'audio, video') {
    super();
    const document = safeGetDocument();
    if (document) {
      this.mediaElements = Array.from(document.querySelectorAll(mediaSelector));
    }
  }
  
  attach(callback: () => void): void {
    if (this.isAttached) {
      this.detach();
    }
    
    const events = ['play', 'pause', 'ended', 'seeked', 'volumechange'];
    
    this.mediaElements.forEach(element => {
      events.forEach(eventType => {
        const listener = () => callback();
        element.addEventListener(eventType, listener);
        
        this.eventListeners.push(() => {
          element.removeEventListener(eventType, listener);
        });
      });
    });
    
    this.isAttached = true;
  }
  
  detach(): void {
    if (this.isAttached) {
      this.cleanup();
      this.isAttached = false;
    }
  }
}