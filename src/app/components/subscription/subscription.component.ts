
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

interface SubscriptionPrice {
  territory: string;
  currency: string;
  customerPrice: number;
  desired_price?: number;
  subscriptionName?: string;
  productId?: string;
  subscriptionPeriod?: string;
}

interface Subscription {
  id: number;
  name: string;
  productId: string;
  subscriptionPeriod: string;
  group: string;
  prices: SubscriptionPrice[];
}

interface Country {
  code: string;
  name: string;
  currency: string;
  currency_symbol?: string;
}

interface SubscriptionDisplay {
  country: string;
  customer_price: number;
  currency: string;
  desired_price?: number;
  subscriptionName: string;
  productId: string;
  subscriptionPeriod: string;
  group: string;
}

@Component({
  selector: 'app-subscription',
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
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  countries: Country[] = [];
  countryMap: Map<string, string> = new Map();
  
  selectedSubscriptionIds: number[] = [];
  selectedSubscription: Subscription | null = null;
  selectedCountries: string[] = [];
  selectedPeriod: string = '';
  
  subscriptionPeriods: string[] = [];
  displayedColumns: string[] = ['name', 'country', 'customer_price', 'desired_price', 'subscription_period', 'group'];


  dataSource = new MatTableDataSource<SubscriptionDisplay>([]);
  
  allPrices: SubscriptionDisplay[] = [];
  displayedPrices: SubscriptionDisplay[] = [];
  private originalPrices: SubscriptionDisplay[] = [];
  
  isLoading = false;
  isUpdatingPrice = false;
  showSuccessMessage = false;
  successMessage = "Prices updated successfully";
  showErrorMessage = false;
  errorMessage = "Error while changing price, please try again"
  
  @ViewChild(MatSort) sort!: MatSort;
  
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
      this.resetAllFilters();
      this.loadCountries();
      this.loadSubscriptions();
    });
  }
  
  private initializeDataSource() {
    this.dataSource.sortingDataAccessor = (data: SubscriptionDisplay, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'name': return data.subscriptionName;
        case 'country': return this.countryMap.get(data.country) || data.country;
        case 'customer_price': return data.customer_price;
        case 'desired_price': return data.desired_price || 0;
        case 'subscription_period': return data.subscriptionPeriod;
        case 'group': return data.group;
        default: return '';
      }
    };
  }
  
  loadSubscriptions(): void {
    this.isLoading = true;
    this.appStoreService.getAllSubscriptions().subscribe({
      next: (data: Subscription[]) => {
        this.subscriptions = data;
        this.filterSubscriptions();
        this.extractSubscriptionPeriods();
        this.showAllSubscriptions();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading subscriptions:', err);
        this.isLoading = false;
      }
    });
  }
  
  loadCountries(): void {
    this.appStoreService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.countryMap = new Map(
          countries.map(country => [country.code, country.name])
        );
      },
      error: (err) => console.error('Error loading countries:', err)
    });
  }
  
  filterSubscriptions(): void {
    // In your actual implementation, you might need to filter by app name
    // For now, we'll just use all subscriptions
    this.filteredSubscriptions = [...this.subscriptions];
  }
  
  extractSubscriptionPeriods(): void {
    const periods = new Set<string>();
    this.filteredSubscriptions.forEach(sub => {
      if (sub.subscriptionPeriod) {
        periods.add(this.formatSubscriptionPeriod(sub.subscriptionPeriod));
      }
    });
    this.subscriptionPeriods = [...periods];
  }
  
  showAllSubscriptions(): void {
    this.allPrices = this.filteredSubscriptions.flatMap(sub => 
      sub.prices.map(price => ({
        country: price.territory,
        customer_price: price.customerPrice,
        currency: price.currency,
        desired_price: price.desired_price,
        subscriptionName: sub.name,
        productId: sub.productId,
        subscriptionPeriod: this.formatSubscriptionPeriod(sub.subscriptionPeriod),
        group: sub.group
      }))
    );
    this.displayedPrices = [...this.allPrices];
    this.resetAllFilters();
    this.updateDataSource();
    this.saveOriginalPrices();
  }

  private formatSubscriptionPeriod(period: string): string {
    if (!period) return period;
    
    switch(period) {
      case 'ONE_MONTH': return '1 Month';
      case 'ONE_YEAR': return '1 Year';
      case 'TRIAL': return 'Trial';
      case 'LIFETIME': return 'Lifetime';
      default: return period;
    }
  }
  
  applyFilters(): void {
    if (this.filteredSubscriptions.length === 0) return;
    
    // Start with all prices if not already loaded
    if (this.allPrices.length === 0) {
      this.showAllSubscriptions();
    }
    
    // Filter by selected subscriptions
    if (this.selectedSubscriptionIds.length > 0) {
      const selectedSubs = this.filteredSubscriptions.filter(sub => 
        this.selectedSubscriptionIds.includes(sub.id)
      );
      
      if (selectedSubs.length === 1) {
        this.selectedSubscription = selectedSubs[0];
      } else {
        this.selectedSubscription = null;
      }
      
      this.displayedPrices = this.allPrices.filter(price => {
        return selectedSubs.some(sub => sub.productId === price.productId);
      });
    } else {
      this.selectedSubscription = null;
      this.displayedPrices = [...this.allPrices];
    }
    
    // Filter by selected countries
    if (this.selectedCountries.length > 0) {
      this.displayedPrices = this.displayedPrices.filter(price => 
        this.selectedCountries.includes(price.country)
      );
    }
    
    // Filter by subscription period
    if (this.selectedPeriod) {
      this.displayedPrices = this.displayedPrices.filter(price => 
        price.subscriptionPeriod === this.selectedPeriod
      );
    }
    
    this.updateDataSource();
    this.saveOriginalPrices();
  }
  
  resetCountryFilter(): void {
    this.selectedCountries = [];
    this.applyFilters();
  }
  
  resetSubscriptionFilter(): void {
    this.selectedSubscriptionIds = [];
    this.selectedSubscription = null;
    this.applyFilters();
  }
  
  resetPeriodFilter(): void {
    this.selectedPeriod = '';
    this.applyFilters();
  }
  
  resetAllFilters(): void {
    this.selectedCountries = [];
    this.selectedPeriod = '';
    this.selectedSubscriptionIds = [];
    this.selectedSubscription = null;
  }
  
  resetFilters(): void {
    this.resetAllFilters();
    this.showAllSubscriptions();
  }
  
  private updateDataSource(): void {
    this.dataSource.data = [...this.displayedPrices];
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.dataSource._updateChangeSubscription();
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
  
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
  
  submitAllPriceChanges(): void {
    if (!this.hasPriceChanges() || this.isUpdatingPrice) return;
    
    this.isUpdatingPrice = true;
    
    const changesBySubscription = new Map<number, Array<{country: string, desired_price: number}>>();
    
    // Sauvegardez l'état actuel des filtres
    const currentFilters = {
        countries: [...this.selectedCountries],
        subscriptionIds: [...this.selectedSubscriptionIds],
        period: this.selectedPeriod
    };
    
    this.dataSource.data
      .filter((price, index) => {
        const hasChanged = price.desired_price !== this.originalPrices[index]?.desired_price;
        return hasChanged && price.desired_price !== undefined;
      })
      .forEach(price => {
        let subscriptionId = null;
        
        if (this.selectedSubscriptionIds.length === 1) {
          subscriptionId = this.selectedSubscriptionIds[0];
        } else {
          subscriptionId = this.getSubscriptionIdByProductId(price.productId);
        }
        
        if (subscriptionId !== null) {
          if (!changesBySubscription.has(subscriptionId)) {
            changesBySubscription.set(subscriptionId, []);
          }
          changesBySubscription.get(subscriptionId)!.push({
            country: price.country,
            desired_price: price.desired_price!
          });
        }
      });
    
    if (changesBySubscription.size === 0) {
      this.isUpdatingPrice = false;
      return;
    }
    
    const updatePromises = Array.from(changesBySubscription.entries()).map(([subscriptionId, changes]) => {
      return new Promise<void>((resolve, reject) => {
        this.appStoreService.updateMultipleDesiredPricesSubscription(subscriptionId, changes).subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error(`Error updating prices for subscriptionId ${subscriptionId}:`, err);
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
  
  private getSubscriptionIdByProductId(productId: string): number | null {
    const subscription = this.subscriptions.find(sub => sub.productId === productId);
    return subscription ? subscription.id : null;
  }
  
  getCurrency(countryCode: string): string {
    // First look in the subscription prices
    for (const subscription of this.subscriptions) {
      const price = subscription.prices.find(p => p.territory === countryCode);
      if (price) {
        return price.currency;
      }
    }

    const country = this.countries.find(c => c.code === countryCode);
    return country?.currency || '';
  }
}