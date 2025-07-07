import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private idleService: IdleOAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.oauthService.hasValidAccessToken()) {
      // User is authenticated, start idle detection
      this.idleService.startWatching();
      return true;
    }
    
    // User is not authenticated, redirect to login
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}