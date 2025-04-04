import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports:[MatIcon],
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  showLogout = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.showLogout = !this.router.url.includes('/login');
    
    this.router.events.subscribe(() => {
      this.showLogout = !this.router.url.includes('/login');
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}