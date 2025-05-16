import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

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

interface SubscriptionPrice {
  territory: string;
  currency: string;
  customerPrice: number;
  desired_price?: number;
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

export interface App {
  id: string;
  name: string;
  bundle_id?: string;
}


@Injectable({
  providedIn: 'root',
})
export class AppStoreService {
  private baseUrl = 'http://localhost:5000/api';
  
  constructor(private http: HttpClient) {}
  
  getAvailableApps(): Observable<App[]> {
    return this.http.get<any[]>(`${this.baseUrl}/db/apps`).pipe(
      map(apps => apps.map(app => ({
        id: app.app_id,
        name: app.app_name,
        bundle_id: app.bundle_id
      })))
    );
  }
  
  getAllInAppPurchases(): Observable<InAppPurchase[]> {
    return this.http.get<InAppPurchase[]>(`${this.baseUrl}/inapp/all`);
  }
    
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/countries`);
  }
  
  updateMultipleDesiredPricesInApp(inAppId: string, changes: Array<{country: string, desired_price: number}>): Observable<Price[]> {
    return this.http.patch<Price[]>(
      `${this.baseUrl}/inapp/update-multiple-desired-prices`,
      { inAppId, changes },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
      },
    );
  }

  getAllSubscriptions(): Observable<Subscription[]> {
    const appId = localStorage.getItem('currentAppId');
    return this.http.get<Subscription[]>(`${this.baseUrl}/subscriptions?app_id=${appId}`);
  }

  getSubscriptions() {
    const appId = localStorage.getItem('currentAppId');
    return this.http.get(`/api/subscriptions?app_id=${appId}`);
  }
  
  updateMultipleDesiredPricesSubscription(subscriptionId: number, changes: Array<{country: string, desired_price: number}>): Observable<SubscriptionPrice[]> {
    return this.http.patch<SubscriptionPrice[]>(
      `${this.baseUrl}/subscriptions/update-multiple-desired-prices`,
      { subscriptionId, changes },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
      },
    );
  }

  validateKeys(userId: string, issuerId: string, apiKey: string): Observable<any> {
    return this.http.post<any>('http://localhost:5000/api/validate-credentials', {
      userId, issuerId, apiKey
    });
  }
}
  

