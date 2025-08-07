import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Suppress browser extension console errors
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('message channel closed') || 
      message.includes('runtime.lastError') ||
      message.includes('listener indicated an asynchronous response')) {
    return; // Ignore extension-related errors
  }
  originalError.apply(console, args);
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));