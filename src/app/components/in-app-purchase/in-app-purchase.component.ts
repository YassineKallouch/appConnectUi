import { Component, OnInit, ViewChild } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Price {
  country: string;
  customer_price: number;
  price_type: string;
  proceeds: number;
  is_custom?: boolean;
}

interface InAppPurchase {
  id: string;
  app_name: string;
  bundle_id: string;
  name: string;
  productId: string;
  type: string;
  prices: Price[];
  desired_price?: number;
}

@Component({
  selector: 'app-in-app-purchase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatIcon,
    MatProgressSpinnerModule
  ],
  templateUrl: './in-app-purchase.component.html',
  styleUrls: ['./in-app-purchase.component.css']
})
export class InAppPurchaseComponent implements OnInit {
  inAppPurchases: InAppPurchase[] = [];
  filteredInAppPurchases: InAppPurchase[] = [];
  selectedInApp: InAppPurchase | null = null;
  countries: string[] = ['USA', 'FRA', 'GBR', 'DEU', 'JPN', 'BEL', 'BRA', 'CHN', 'IND', 'RUS'];
  selectedCountry: string = '';
  displayedPrices: Price[] = [];
  isLoading = false;
  isUpdatingPrice = false;
  syncStatus = '';

  displayedColumns: string[] = ['name', 'country', 'customer_price', 'price_type'];
  dataSource = new MatTableDataSource<Price>([]);
  allPrices: any[] = [];
  desiredPrice?: number;

  @ViewChild(MatSort) sort!: MatSort;
  selectedInAppId: string | null = null;
  appName: string = '';

  constructor(
    private appStoreService: AppStoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appName = params['appName'];
      this.loadInAppPurchases();
    });
  }

  loadInAppPurchases(): void {
    this.isLoading = true;
    this.appStoreService.getAllInAppPurchases().subscribe({
      next: (data: InAppPurchase[]) => {
        this.inAppPurchases = data;
        const validApps = [...new Set(this.inAppPurchases.map(inApp => inApp.app_name))];

        if (!validApps.includes(this.appName)) {
          this.router.navigateByUrl('/');
          return;
        }

        this.filterInAppPurchases();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading in-app purchases:', err);
        this.router.navigateByUrl('/');
        this.isLoading = false;
      }
    });
  }

  filterInAppPurchases(): void {
    if (!this.appName) return;

    this.filteredInAppPurchases = this.inAppPurchases.filter(
      (inApp) => inApp.app_name === this.appName
    );

    if (this.filteredInAppPurchases.length > 0) {
      this.showAllInApps();
    }
  }

  filterPrices(): void {
    if (this.selectedInApp) {
      this.displayedPrices = this.selectedCountry
        ? this.selectedInApp.prices.filter(p => p.country === this.selectedCountry)
        : [...this.selectedInApp.prices]; // Crée une nouvelle référence
    } else {
      this.displayedPrices = this.selectedCountry
        ? this.allPrices.filter(p => p.country === this.selectedCountry)
        : [...this.allPrices];
    }
    this.updateDataSource();
  }

  selectInApp(inAppId: string): void {
    this.selectedInApp = this.filteredInAppPurchases.find(inApp => inApp.id === inAppId) || null;
    this.selectedInAppId = inAppId;
    this.selectedCountry = '';
    this.desiredPrice = this.selectedInApp?.desired_price;
    
    // Force le recalcul des prix affichés
    this.displayedPrices = this.selectedInApp ? [...this.selectedInApp.prices] : [];
    this.updateDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  goHome(): void {
    this.router.navigateByUrl('/');
  }

  showAllInApps(): void {
    this.allPrices = this.filteredInAppPurchases.flatMap(inApp => 
      inApp.prices.map(price => ({
        ...price,
        inAppName: inApp.name,
        productId: inApp.productId
      }))
    );
    this.displayedPrices = [...this.allPrices];
    this.selectedCountry = '';
    this.desiredPrice = undefined;
  }

  onInAppSelectionChange(): void {
    if (this.selectedInAppId) {
      const foundInApp = this.filteredInAppPurchases.find(inApp => inApp.id === this.selectedInAppId);
      this.selectedInApp = foundInApp || null;
      
      if (this.selectedInApp) {
        this.desiredPrice = this.selectedInApp.desired_price;
        this.displayedPrices = [...this.selectedInApp.prices];
      }
    } else {
      this.selectedInApp = null;
      this.showAllInApps();
    }
    this.updateDataSource();
  }

  updateDesiredPrice(): void {
    if (this.desiredPrice === undefined || this.desiredPrice <= 0 || !this.selectedInApp) {
      return;
    }

    this.isUpdatingPrice = true;
    this.appStoreService.updateDesiredPrice(
      this.selectedInApp.id, 
      this.desiredPrice
    ).subscribe({
      next: (updatedPrices: Price[]) => {
        if (this.selectedInApp) {
          this.selectedInApp.prices = updatedPrices;
          this.selectedInApp.desired_price = this.desiredPrice;
          this.filterPrices();
        }
        this.isUpdatingPrice = false;
      },
      error: (err) => {
        console.error('Error updating price:', err);
        this.isUpdatingPrice = false;
      }
    });
  }

  private updateDataSource(): void {
    this.dataSource.data = [...this.displayedPrices];
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.dataSource._updateChangeSubscription();
  }

  isPriceValid(): boolean {
    return this.desiredPrice !== undefined && this.desiredPrice > 0;
  }
}