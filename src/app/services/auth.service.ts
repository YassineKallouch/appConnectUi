// aut.service.ts


import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  message: string;
  token?: string;
}

interface RegisterResponse {
  message: string;
}

interface RegisterUserData {
  name: string;
  birthday: string;
  email: string;
  password: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  private isBrowser: boolean;


  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);

  }


  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        if (response.message === "Connexion réussie" && this.isBrowser) {
          localStorage.setItem('authToken', 'mock-token');
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }



  private handleError(error: HttpErrorResponse) {
    console.error('Erreur complète:', error);
    
    let errorMessage = 'Une erreur est survenue';
    if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('authToken') : false;
  }

  register(userData: { name: string; birthday: string; email: string; password: string; }) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}