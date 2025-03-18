import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStoreService {

  private apiUrl = "http:localhost:5000/api/db" 

  constructor(private http:HttpClient) { }


  getAllApps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/apps`);
  }

  // Récupère tous les achats in-app
  getAllInAppPurchases(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inapp`);
  }

  // Récupère les détails d'un achat in-app spécifique
  getInAppPurchaseDetails(inAppId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inapp/${inAppId}`);
  }

  // Récupère tous les prix pour un pays spécifique
  getPricesByCountry(countryCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/prices/${countryCode}`);
  }

  // Méthode pour synchroniser les données avec l'API App Store Connect
  // Cette méthode sera utilisée pour mettre à jour la base de données
  syncDataWithAppStoreConnect(): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/inapp/all');
  }



}
