import { Component } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { InAppPurchaseComponent } from './components/in-app-purchase/in-app-purchase.component';
import { Router } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, NavigationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showNavigation = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavigationVisibility(event.url);
      });
  }

  private updateNavigationVisibility(url: string): void {
    // Cache la navigation pour les routes login et home
    this.showNavigation = !url.includes('/login') && url !== '/';
  }
}