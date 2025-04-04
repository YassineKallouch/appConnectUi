// auth.guard.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
    constructor(
      private auth: AuthService,
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {}
  
    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
      
      if (!this.auth.isLoggedIn()) {
        if (isPlatformBrowser(this.platformId)) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
        }
        return false;
      }
      return true;
    }
  }