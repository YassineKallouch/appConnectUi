import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Price {
  country: string;
  customer_price: number;
  price_type: string;
  proceeds: number;
}

interface InAppPurchase {
  id: string;
  app_name: string;
  bundle_id: string;
  name: string;
  productId: string;
  type: string;
  prices: Price[];
}

@Component({
  selector: 'app-in-app-purchase',
  //standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './in-app-purchase.component.html',
  styleUrls: ['./in-app-purchase.component.css'],
})
export class InAppPurchaseComponent implements OnInit {
  inAppPurchases: InAppPurchase[] = [];
  selectedInApp: InAppPurchase | null = null;
  countries: string[] = ['USA', 'FRA', 'GBR', 'DEU', 'JPN', 'BEL', 'BRA', 'CHN', 'IND', 'RUS'];
  selectedCountry: string = '';
  displayedPrices: Price[] = [];
  isLoading = false;
  syncStatus = '';

  constructor(private appStoreService: AppStoreService) {}

  ngOnInit(): void {
    this.loadInAppPurchases();
  }

  loadInAppPurchases(): void {
    this.isLoading = true;
    this.appStoreService.getAllInAppPurchases().subscribe({
      next: (data) => {
        this.inAppPurchases = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching in-app purchases', error);
        this.isLoading = false;
      },
    });
  }

  selectInApp(inAppId: string): void {
    const foundInApp = this.inAppPurchases.find((inApp) => inApp.id === inAppId);
    this.selectedInApp = foundInApp || null; // Gérer le cas où find ne trouve rien

    if (this.selectedInApp) {
      this.displayedPrices = this.selectedInApp.prices;
    } else {
      this.displayedPrices = []; // Réinitialiser les prix si aucun achat n'est sélectionné
    }
  }

  filterPrices(): void {
    if (!this.selectedInApp) return;

    if (this.selectedCountry) {
      this.displayedPrices = this.selectedInApp.prices.filter(
        (price: Price) => price.country === this.selectedCountry
      );
    } else {
      this.displayedPrices = this.selectedInApp.prices;
    }
  }

  syncData(): void {
    this.isLoading = true;
    this.syncStatus = 'Synchronisation en cours...';
    this.appStoreService.syncDataWithAppStoreConnect().subscribe({
      next: () => {
        this.syncStatus = 'Synchronisation réussie !';
        this.loadInAppPurchases();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error syncing data', error);
        this.syncStatus = 'Échec de la synchronisation';
        this.isLoading = false;
      },
    });
  }
}