import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Vous pouvez déplacer ces interfaces dans un fichier séparé 
// (par exemple models/app-store.model.ts) et les importer ici
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

@Injectable({
  providedIn: 'root',
})
export class AppStoreService {
  private apiUrl = 'http://localhost:5000/api/inapp/all';

  constructor(private http: HttpClient) {}

  // Récupère tous les achats in-app
  getAllInAppPurchases(): Observable<InAppPurchase[]> {
    return this.http.get<InAppPurchase[]>(this.apiUrl);
  }

  // Récupère les détails d'un achat in-app spécifique
  getInAppPurchaseDetails(inAppId: string): Observable<InAppPurchase> {
    return this.http.get<InAppPurchase>(`${this.apiUrl}/${inAppId}`);
  }

  // Récupère tous les prix pour un pays spécifique
  getPricesByCountry(countryCode: string): Observable<Price[]> {
    return this.http.get<Price[]>(`${this.apiUrl}/prices/${countryCode}`);
  }

  /*getAllCountries(): Observable<Price[]> {
    return this.http.get<Price[]>(`${this.apiUrl}/api/countries`);
  }
  */

  // Méthode pour synchroniser les données avec l'API App Store Connect
  syncDataWithAppStoreConnect(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
}