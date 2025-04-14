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
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';
import { NavigationComponent } from '../navigation/navigation.component';

interface Price {
  country: string;
  customer_price: number;
  price_type: string;
  proceeds: number;
  desired_price?: number;
  is_custom?: boolean;
  inAppName?: string;
  productId?: string;
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

interface Country {
  code: string;
  name: string;
  currency: string;
  currency_symbol?: string;
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
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    HeaderComponent,
    NavigationComponent,
  ],
  templateUrl: './in-app-purchase.component.html',
  styleUrls: ['./in-app-purchase.component.css']
})
export class InAppPurchaseComponent implements OnInit {
  inAppPurchases: InAppPurchase[] = [];
  filteredInAppPurchases: InAppPurchase[] = [];
  selectedInApp: InAppPurchase | null = null;
  countries: Country[] = [];
  countryMap: Map<string, string> = new Map();
  selectedCountry: string = '';
  displayedPrices: Price[] = [];
  isLoading = false;
  isUpdatingPrice = false;
  syncStatus = '';

  displayedColumns: string[] = ['name', 'country', 'customer_price', 'desired_price', 'price_type'];
  dataSource = new MatTableDataSource<Price>([]);
  allPrices: Price[] = [];
  private originalPrices: Price[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  selectedInAppId: string | null = null;
  
  appName: string = '';

  constructor(
    private appStoreService: AppStoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDataSource();
    this.route.params.subscribe(params => {
      // Réinitialiser l'état du composant à chaque changement d'application
      this.appName = params['appName'];
      this.selectedInAppId = null;
      this.selectedInApp = null;
      this.displayedPrices = [];
      this.dataSource.data = [];
      this.allPrices = [];
      this.originalPrices = [];
      this.selectedCountry = '';
      
      // Ensuite charger les nouvelles données
      this.loadCountries();
      this.loadInAppPurchases();
    });
  }
  private initializeDataSource() {
    this.dataSource.sortingDataAccessor = (data: Price, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'name': return data.inAppName || this.selectedInApp?.name || '';
        case 'country': return this.countryMap.get(data.country) || data.country;
        case 'customer_price': return data.customer_price;
        case 'desired_price': return data.desired_price || 0;
        case 'price_type': return data.price_type;
        default: return '';
      }
    };
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

    //if (this.filteredInAppPurchases.length > 0) {
    //  this.showAllInApps();
    //}
  }

  filterPrices(): void {
    if (this.selectedInApp) {
      this.displayedPrices = this.selectedCountry
        ? this.selectedInApp.prices.filter(p => p.country === this.selectedCountry)
        : [...this.selectedInApp.prices];
    } else {
      this.displayedPrices = this.selectedCountry
        ? this.allPrices.filter(p => p.country === this.selectedCountry)
        : [...this.allPrices];
    }
    this.updateDataSource();
    this.saveOriginalPrices();
  }

  selectInApp(inAppId: string): void {
    this.selectedInApp = this.filteredInAppPurchases.find(inApp => inApp.id === inAppId) || null;
    this.selectedInAppId = inAppId;
    this.selectedCountry = '';
    
    this.displayedPrices = this.selectedInApp ? [...this.selectedInApp.prices] : [];
    this.updateDataSource();
    this.saveOriginalPrices();
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
    this.selectedInAppId = '';
    this.selectedInApp = null;
    this.selectedCountry = '';
    this.updateDataSource();
    this.saveOriginalPrices();
  }

  onInAppSelectionChange(): void {
    if (this.selectedInAppId) {
      const foundInApp = this.filteredInAppPurchases.find(inApp => inApp.id === this.selectedInAppId);
      this.selectedInApp = foundInApp || null;
      
      if (this.selectedInApp) {
        this.displayedPrices = [...this.selectedInApp.prices];
      }
    } else {
      this.selectedInApp = null;
      this.showAllInApps();
    }
    this.updateDataSource();
    this.saveOriginalPrices();
  }

  private saveOriginalPrices() {
    this.originalPrices = JSON.parse(JSON.stringify(this.dataSource.data));
  }

  hasPriceChanges(): boolean {
    if (!this.originalPrices.length || !this.dataSource.data.length) return false;
    
    return this.dataSource.data.some((price, index) => {
      return price.desired_price !== this.originalPrices[index]?.desired_price;
    });
  }

  submitAllPriceChanges(): void {
    if (!this.hasPriceChanges()) return;
    
    this.isUpdatingPrice = true;
    
    // Récupérer les changements avec leurs identifiants d'in-app correspondants
    const changesByInApp = new Map<string, Array<{country: string, desired_price: number}>>();
    
    this.dataSource.data
      .filter((price, index) => {
        const hasChanged = price.desired_price !== this.originalPrices[index]?.desired_price;
        return hasChanged && price.desired_price !== undefined;
      })
      .forEach(price => {
        // Si on est en mode "tous les in-apps", on a besoin de savoir à quel in-app chaque prix appartient
        const inAppId = this.selectedInAppId || 
                       (price.productId && this.getInAppIdByProductId(price.productId));
        
        if (inAppId) {
          if (!changesByInApp.has(inAppId)) {
            changesByInApp.set(inAppId, []);
          }
          
          changesByInApp.get(inAppId)!.push({
            country: price.country,
            desired_price: price.desired_price!
          });
        }
      });
    
    if (changesByInApp.size === 0) {
      this.isUpdatingPrice = false;
      return;
    }
    
    // Utiliser Promise.all pour attendre que toutes les mises à jour soient terminées
    const updatePromises = Array.from(changesByInApp.entries()).map(([inAppId, changes]) => {
      return new Promise<void>((resolve, reject) => {
        this.appStoreService.updateMultipleDesiredPrices(inAppId, changes).subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error(`Error updating prices for inAppId ${inAppId}:`, err);
            reject(err);
          }
        });
      });
    });
    
    Promise.all(updatePromises)
      .then(() => {
        // Recharger les données après toutes les mises à jour
        this.loadInAppPurchases();
        this.isUpdatingPrice = false;
      })
      .catch(() => {
        this.isUpdatingPrice = false;
      });
  }

  private getInAppIdByProductId(productId: string): string | null {
    const inApp = this.inAppPurchases.find(app => app.productId === productId);
    return inApp ? inApp.id : null;
  }

  private updateDataSource(): void {
    this.dataSource.data = [...this.displayedPrices];
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.dataSource._updateChangeSubscription();
  }

  
  loadCountries(): void {
    this.appStoreService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.countryMap = new Map(
          countries.map(country => [country.code, country.name])
        );
      },
      error: (err) => console.error('Erreur chargement pays:', err)
    });
  }

  getCurrency(countryCode: string): string {
    const country = this.countries.find(c => c.code === countryCode);
    return country?.currency || '';
  }
}