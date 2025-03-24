import { Component, OnInit, ViewChild } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  imports: [CommonModule, 
            FormsModule,
            MatTableModule,
            MatPaginatorModule,
            MatSortModule,
            MatSelectModule,
            MatCardModule,
            MatFormFieldModule
          ],
  templateUrl: './in-app-purchase.component.html',
  styleUrls: ['./in-app-purchase.component.css'],
})
export class InAppPurchaseComponent implements OnInit {
  inAppPurchases: InAppPurchase[] = [];
  filteredInAppPurchases: InAppPurchase[] = []; // Nouvelle propriété pour les achats filtrés
  selectedInApp: InAppPurchase | null = null;
  countries: string[] = ['USA', 'FRA', 'GBR', 'DEU', 'JPN', 'BEL', 'BRA', 'CHN', 'IND', 'RUS'];
  selectedCountry: string = '';
  displayedPrices: Price[] = [];
  isLoading = false;
  syncStatus = '';

  displayedColumns: string[] = ['country', 'customer_price', 'proceeds', 'price_type'];
  dataSource = new MatTableDataSource<Price>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  selectedInAppId: string | null = null;

  constructor(private appStoreService: AppStoreService) {}

  ngOnInit(): void {
    this.loadInAppPurchases();
  }

  loadInAppPurchases(): void {
    this.isLoading = true;
    this.appStoreService.getAllInAppPurchases().subscribe({
      next: (data) => {
        this.inAppPurchases = data;
        this.filteredInAppPurchases = data; // Initialiser avec tous les achats
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching in-app purchases', error);
        this.isLoading = false;
      },
    });
  }
  

  // Nouvelle méthode pour filtrer les achats in-app par application
  filterInAppPurchases(appName: string): void {
    this.filteredInAppPurchases = this.inAppPurchases.filter(
      (inApp) => inApp.app_name === appName
    );
    this.selectedInApp = null; // Réinitialiser la sélection
    this.displayedPrices = []; // Réinitialiser les prix affichés
  }

  // Modifiez ou ajoutez cette méthode
  onInAppSelectionChange(): void {
    if (this.selectedInAppId) {
      this.selectInApp(this.selectedInAppId);
    } else {
      this.selectedInApp = null;
      this.dataSource.data = [];
    }
  }

  // Modifiez selectInApp pour garder la même logique
  selectInApp(inAppId: string): void {
    const foundInApp = this.inAppPurchases.find(inApp => inApp.id === inAppId);
    this.selectedInApp = foundInApp || null;
    this.selectedCountry = ''; // Réinitialise le filtre de pays
    
    if (this.selectedInApp) {
      this.filterPrices(); // Applique le filtre immédiatement
    } else {
      this.dataSource.data = [];
    }
  }

/*
  selectInApp(inAppId: string): void {
    const foundInApp = this.inAppPurchases.find((inApp) => inApp.id === inAppId);
    this.selectedInApp = foundInApp || null;

    if (this.selectedInApp) {
      this.displayedPrices = this.selectedInApp.prices;
    } else {
      this.displayedPrices = [];
    }
  }
*/
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    
    this.dataSource.data = this.displayedPrices;
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