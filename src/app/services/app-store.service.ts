import { FF_EQUALS } from '@angular/cdk/keycodes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Vous pouvez déplacer ces interfaces dans un fichier séparé 
// (par exemple models/app-store.model.ts) et les importer ici
interface Price {
  country: string;
  customer_price: number;
  price_type: string;
  proceeds: number;
  desired_price?: number;
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
}

interface Country {
  code: string;
  name: string;
  currency: string;
  currency_symbol?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppStoreService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Récupère tous les achats in-app
  getAllInAppPurchases(): Observable<InAppPurchase[]> {
    return this.http.get<InAppPurchase[]>(`${this.baseUrl}/inapp/all`);
  }

  // Récupère les détails d'un achat in-app spécifique
  getInAppPurchaseDetails(inAppId: string): Observable<InAppPurchase> {
    return this.http.get<InAppPurchase>(`${this.baseUrl}/${inAppId}`);
  }

  // Récupère tous les prix pour un pays spécifique
  getPricesByCountry(countryCode: string): Observable<Price[]> {
    return this.http.get<Price[]>(`${this.baseUrl}/prices/${countryCode}`);
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/countries`);
  }

  /*getAllCountries(): Observable<Price[]> {
    return this.http.get<Price[]>(`${this.baseUrl}/api/countries`);
  }
  */

  // Méthode pour synchroniser les données avec l'API App Store Connect
  syncDataWithAppStoreConnect(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  updateDesiredPrice(inAppId: string, price: number): Observable<Price[]> {
    return this.http.patch<Price[]>(
      `${this.baseUrl}/inapp/update-desired-price`,
      { inAppId, desiredPrice: price },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
      },
    );
  }
}