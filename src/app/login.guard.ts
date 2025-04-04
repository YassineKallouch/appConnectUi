import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import { AuthService } from './services/auth.service';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
    providedIn: 'root'
  })
  export class LoginGuard implements CanActivate {
    constructor(
      private auth: AuthService, 
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {}
  
    canActivate(): boolean {
      if (this.auth.isLoggedIn()) {
        if (isPlatformBrowser(this.platformId)) {
          this.router.navigate(['/']);
        }
        return false;
      }
      return true;
    }
  }