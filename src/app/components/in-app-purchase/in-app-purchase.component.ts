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
            MatSortModule,
            MatSelectModule,
            MatCardModule,
            MatFormFieldModule,
            MatIcon
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

  @ViewChild(MatSort) sort!: MatSort;


  selectedInAppId: string | null = null;
  appName: string = '';

  constructor(
    private appStoreService: AppStoreService,
    private route: ActivatedRoute, // 👈 Ajout de ActivatedRoute
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer appName depuis l'URL
    this.route.params.subscribe(params => {
      this.appName = params['appName']; // 👈 Récupère l'URL dynamique
      this.loadInAppPurchases();
    });
  }

  loadInAppPurchases(): void {
    this.appStoreService.getAllInAppPurchases().subscribe({
      next: (data) => {
        this.inAppPurchases = data;
        
        // Liste des applications valides
        const validApps = [...new Set(this.inAppPurchases.map(inApp => inApp.app_name))];

        if (!validApps.includes(this.appName)) {
          this.router.navigateByUrl('/'); // 👈 Redirige si appName est invalide
          return;
        }

        this.filterInAppPurchases();
      },
      error: () => {
        this.router.navigateByUrl('/'); // 👈 Redirige aussi en cas d'erreur API
      },
    });
  }

  // 🔹 **Méthode pour filtrer les achats par application**
  filterInAppPurchases(): void {
    if (!this.appName) return; // Si pas d'appName, ne filtre pas

    this.filteredInAppPurchases = this.inAppPurchases.filter(
      (inApp) => inApp.app_name === this.appName
    );

    if (this.filteredInAppPurchases.length > 0) {
      this.selectedInApp = null; // Sélectionner le 1er élément
      this.filterPrices();
    }
  }



  filterPrices(): void {
    if (!this.selectedInApp) return;
    this.displayedPrices = this.selectedInApp.prices;
    this.dataSource.data = this.displayedPrices;
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
    this.dataSource.sort = this.sort;
  }

  goHome(){
    this.router.navigateByUrl('/');
  }


}