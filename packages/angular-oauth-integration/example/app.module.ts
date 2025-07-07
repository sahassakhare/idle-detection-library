import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// OAuth
import { OAuthModule } from 'angular-oauth2-oidc';

// Idle Detection
import { IdleOAuthModule } from '@idle-detection/angular-oauth-integration';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from './auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AuthGuard]
      }
    ]),
    
    // OAuth configuration
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['https://api.example.com'],
        sendAccessToken: true
      }
    }),
    
    // Idle Detection configuration
    IdleOAuthModule.forRoot({
      idleTimeout: 15 * 60 * 1000,    // 15 minutes
      warningTimeout: 2 * 60 * 1000,  // 2 minutes
      autoRefreshToken: true,
      showWarningDialog: true,
      timeoutRedirectUrl: '/login?reason=timeout',
      enableMultiTabCoordination: true,
      multiTabStorageKey: 'example-app-idle',
      debug: true
    })
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }