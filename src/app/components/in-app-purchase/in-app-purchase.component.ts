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
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule,
  ],
  templateUrl: './in-app-purchase.component.html',
  styleUrls: ['./in-app-purchase.component.css']
})
export class InAppPurchaseComponent implements OnInit {

  isCountryFilterVisible: boolean = false;
  
  inAppPurchases: InAppPurchase[] = [];
  filteredInAppPurchases: InAppPurchase[] = [];
  selectedInApp: InAppPurchase | null = null;
  countries: Country[] = [];
  countryMap: Map<string, string> = new Map();
  selectedCountries: string[] = [];
  selectedType: string = '';
  selectedPriceType: string = '';
  inAppTypes: string[] = [];
  priceTypes: string[] = [];
  displayedPrices: Price[] = [];
  isLoading = false;
  isUpdatingPrice = false;
  syncStatus = '';
  showSuccessMessage = false;
  successMessage = "Prices updated successfully";
  showErrorMessage = false;
  errorMessage = "Error while changing price, please try again"

  displayedColumns: string[] = ['name', 'country', 'customer_price', 'desired_price', 'price_type'];
  dataSource = new MatTableDataSource<Price>([]);
  allPrices: Price[] = [];
  private originalPrices: Price[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  selectedInAppIds: string[] = [];
  
  appName: string = '';

  constructor(
    private appStoreService: AppStoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDataSource();
    this.route.params.subscribe(params => {
      this.appName = params['appName'];
      this.selectedInAppIds = [];
      this.selectedInApp = null;
      this.displayedPrices = [];
      this.dataSource.data = [];
      this.allPrices = [];
      this.originalPrices = [];
      this.selectedCountries = [];
      this.selectedType = '';
      this.selectedPriceType = '';
      this.isCountryFilterVisible = false;
      this.loadCountries();
      this.loadInAppPurchases();
    });
  }

  toggleCountryFilterVisibility(): void {
    this.isCountryFilterVisible = !this.isCountryFilterVisible;
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
        this.inAppTypes = [...new Set(this.filteredInAppPurchases.map(inApp => inApp.type))];               
        this.showAllInApps();       
        this.extractPriceTypes();        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading in-app purchases:', err);
        this.router.navigateByUrl('/');
        this.isLoading = false;
      }
    });
  }

  extractPriceTypes(): void {
    // Extraire tous les types de prix uniques
    const allPriceTypes = new Set<string>();
    this.filteredInAppPurchases.forEach(inApp => {
      inApp.prices.forEach(price => {
        if (price.price_type) {
          allPriceTypes.add(price.price_type);
        }
      });
    });
    this.priceTypes = [...allPriceTypes];
  }

  filterInAppPurchases(): void {
    if (!this.appName) return;
    this.filteredInAppPurchases = this.inAppPurchases.filter(
      (inApp) => inApp.app_name === this.appName
    );
  }

  applyFilters(): void {
    // Commencer avec tous les prix
    if (this.filteredInAppPurchases.length === 0) return;
    
    // Récupérer tous les prix si pas encore fait
    if (this.allPrices.length === 0) {
      this.allPrices = this.filteredInAppPurchases.flatMap(inApp => 
        inApp.prices.map(price => ({
          ...price,
          inAppName: inApp.name,
          productId: inApp.productId
        }))
      );
    }
    
    // Filtrer par in-apps si sélectionnés
    if (this.selectedInAppIds.length > 0) {
      // Filtrer les prix pour n'inclure que ceux des in-apps sélectionnés
      const selectedInApps = this.filteredInAppPurchases.filter(inApp => 
        this.selectedInAppIds.includes(inApp.id)
      );
      
      if (selectedInApps.length === 1) {
        this.selectedInApp = selectedInApps[0];
      } else {
        this.selectedInApp = null;
      }
      
      this.displayedPrices = this.allPrices.filter(price => {
        return selectedInApps.some(inApp => inApp.productId === price.productId);
      });
    } else {
      this.selectedInApp = null;
      this.displayedPrices = [...this.allPrices];
    }
    
    // Filtrer par pays si sélectionnés
    if (this.selectedCountries.length > 0) {
      this.displayedPrices = this.displayedPrices.filter(price => 
        this.selectedCountries.includes(price.country)
      );
    }
    
    // Filtrer par type d'in-app si sélectionné
    if (this.selectedType && this.selectedInApp === null) {
      const inAppsOfType = this.filteredInAppPurchases
        .filter(inApp => inApp.type === this.selectedType)
        .map(inApp => inApp.productId);
      
      this.displayedPrices = this.displayedPrices.filter(price => 
        inAppsOfType.includes(price.productId || '')
      );
    }
    
    // Filtrer par type de prix si sélectionné
    if (this.selectedPriceType) {
      this.displayedPrices = this.displayedPrices.filter(price => 
        price.price_type === this.selectedPriceType
      );
    }
    
    this.updateDataSource();
    this.saveOriginalPrices();
  }

  // Méthodes pour gérer les sélections de pays
  isCountrySelected(countryCode: string): boolean {
    return this.selectedCountries.includes(countryCode);
  }

  toggleCountrySelection(countryCode: string): void {
    const index = this.selectedCountries.indexOf(countryCode);
    if (index === -1) {
      this.selectedCountries.push(countryCode);
    } else {
      this.selectedCountries.splice(index, 1);
    }
    this.applyFilters();
  }

  // Méthodes de réinitialisation pour chaque filtre individuel
  resetCountryFilter(): void {
    this.selectedCountries = [];
    this.applyFilters();
  }

  resetInAppFilter(): void {
    this.selectedInAppIds = [];
    this.selectedInApp = null;
    this.applyFilters();
  }

  /*resetTypeFilter(): void {
    this.selectedType = '';
    this.applyFilters();
  }*/

  resetPriceTypeFilter(): void {
    this.selectedPriceType = '';
    this.applyFilters();
  }

  selectInApp(inAppId: string): void {
    this.selectedInAppIds = [inAppId];
    this.selectedInApp = this.filteredInAppPurchases.find(inApp => inApp.id === inAppId) || null;
    this.selectedCountries = [];
    this.selectedType = '';
    this.selectedPriceType = '';
    this.applyFilters();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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
    this.selectedInAppIds = [];
    this.selectedInApp = null;
    this.selectedCountries = [];
    this.selectedType = '';
    this.selectedPriceType = '';
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
    if (!this.hasPriceChanges() || this.isUpdatingPrice) return;
    
    this.isUpdatingPrice = true;
    
    const changesByInApp = new Map<string, Array<{country: string, desired_price: number}>>();
    
    this.dataSource.data
      .filter((price, index) => {
        const hasChanged = price.desired_price !== this.originalPrices[index]?.desired_price;
        return hasChanged && price.desired_price !== undefined;
      })
      .forEach(price => {
        let inAppId = null;
        
        if (this.selectedInAppIds.length === 1) {
          inAppId = this.selectedInAppIds[0];
        } else {
          inAppId = this.getInAppIdByProductId(price.productId || '');
        }
        
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
    
    const updatePromises = Array.from(changesByInApp.entries()).map(([inAppId, changes]) => {
      return new Promise<void>((resolve, reject) => {
        this.appStoreService.updateMultipleDesiredPricesInApp(inAppId, changes).subscribe({
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
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
        this.loadInAppPurchases();
        this.saveOriginalPrices();
      })
      .catch((error) => {
        this.showErrorMessage = true;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      })
      .finally(() => {
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
  
  resetFilters(): void {
    this.selectedCountries = [];
    this.selectedType = '';
    this.selectedPriceType = '';
    this.selectedInAppIds = [];
    this.selectedInApp = null;
    this.isCountryFilterVisible = false;
    this.showAllInApps();
  }
}