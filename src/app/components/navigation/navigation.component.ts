import { Component, OnInit, signal } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule,
            MatMenuModule,
            MatButtonModule,
            MatIconModule,
            MatDivider,
            FormsModule,
            MatTableModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  availableApps: any[] = [];
  isLoading = true;
  currentAppName: string | null = null;
  
  selectedView: string = 'description';

  constructor(
    private appStoreService: AppStoreService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateCurrentApp(event.url);
        this.updateSelectedView(event.url);
      });
  }

  updateSelectedView(url: string): void {
    if (url.includes('/in-app')) {
      this.selectedView = 'in-app';
    } else if (url.includes('/subscriptions')) {
      this.selectedView = 'subscription';
    } else if (url.includes('/availability')) {
      this.selectedView = 'availability';
    } else if (url.includes('/pricing')) {
      this.selectedView = 'pricing';
    } else {
      this.selectedView = 'description';
    }
  }

  onViewChange(): void {
    if (!this.currentAppName) return;
    console.log('View changed to:', this.selectedView);
    
    switch (this.selectedView) {
      case 'in-app':
        this.router.navigate(['/', this.currentAppName, 'in-app']);
        break;
      case 'subscription':
        this.router.navigate(['/', this.currentAppName, 'subscriptions']);
        break;
      case 'availability':
        this.router.navigate(['/', this.currentAppName, 'availability']);
        break;
      case 'pricing':
        this.router.navigate(['/', this.currentAppName, 'pricing']);
        break;
      default:
        this.router.navigate(['/', this.currentAppName]);
    }
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
    
    // Décode l'URL pour gérer les espaces et caractères spéciaux
    const decodedUrl = decodeURIComponent(url);
    // Trouve l'application qui correspond
    const app = this.availableApps.find(a => {
      // Vérifie si le nom de l'app (tel quel) est dans l'URL décodée
      return decodedUrl.includes(`/${a.name}`);
    });
    
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