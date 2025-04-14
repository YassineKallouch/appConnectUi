import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';
import { Router } from '@angular/router';
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

  constructor(
    private appStoreService: AppStoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvailableApps();
  }

  loadAvailableApps(): void {
    this.appStoreService.getAvailableApps().subscribe({
      next: (apps) => {
        this.availableApps = apps;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load apps', err);
        this.isLoading = false;
      }
    });
  }

  navigateToApp(app: any): void {
    this.router.navigate([`/${app.name}`]);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}