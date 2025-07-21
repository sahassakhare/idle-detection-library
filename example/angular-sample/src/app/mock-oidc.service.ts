import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OidcSecurityService {
  isAuthenticated$ = of({ isAuthenticated: true });
  userData$ = of({ role: 'user' });
  
  authorize() {
    console.log('Mock authorize called');
  }
  
  logoff() {
    console.log('Mock logoff called');
  }
}