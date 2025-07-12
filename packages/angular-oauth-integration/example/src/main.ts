import { bootstrapApplication } from '@angular/platform-browser';
import { MinimalWorkingAppComponent } from './app/minimal-working-app.component';
import { minimalAppConfig } from './app/minimal-app.config';

console.log('🔄 Bootstrapping Minimal Working App...');

bootstrapApplication(MinimalWorkingAppComponent, minimalAppConfig)
  .then(() => console.log('✅ App successfully bootstrapped!'))
  .catch(err => {
    console.error('❌ Bootstrap Error:', err);
    console.error('Stack trace:', err.stack);
  });