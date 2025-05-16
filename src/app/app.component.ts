import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationComponent } from './components/navigation/navigation.component';
import { LogoutComponent } from './components/logout/logout.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, NavigationComponent, LogoutComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showNavigation = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const isAuthPage = event.url === '/login' || event.url === '/register' || event.url === '/';
      this.showNavigation = !isAuthPage;
    });
    
    const currentUrl = this.router.url;
    const isAuthPage = currentUrl === '/login' || currentUrl === '/register' || currentUrl === '/';
    this.showNavigation = !isAuthPage;
  }
}