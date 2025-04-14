import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, MatDivider],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  availableApps: any[] = [];
  isLoading = true;
  currentAppName: string | null = null;

  constructor(
    private appStoreService: AppStoreService,
    private router: Router
  ) {
    // Écoute les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateCurrentApp(event.url);
      });
  }

  ngOnInit(): void {
    this.loadAvailableApps();
    this.updateCurrentApp(this.router.url);
  }

  updateCurrentApp(url: string): void {
    if (url === '/') {
      this.currentAppName = null;
      return;
    }
    
    // Extrait le nom de l'app de l'URL (/appName/...)
    const app = this.availableApps.find(a => url.startsWith(`/${a.name}`));
    this.currentAppName = app ? app.name : null;
  }

  loadAvailableApps(): void {
    this.appStoreService.getAvailableApps().subscribe({
      next: (apps) => {
        this.availableApps = apps;
        this.isLoading = false;
        this.updateCurrentApp(this.router.url);
      },
      error: (err) => {
        console.error('Failed to load apps', err);
        this.isLoading = false;
      }
    });
  }

  navigateToApp(app: any): void {
    this.router.navigate([`/${app.name}`]).then(() => {
      this.updateCurrentApp(this.router.url);
    });
  }

  goHome(): void {
    this.currentAppName = null;
    this.router.navigate(['/']);
  }

  isCurrentApp(app: any): boolean {
    return this.currentAppName === app.name;
  }
}