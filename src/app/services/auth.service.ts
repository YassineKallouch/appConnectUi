import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface LoginResponse {
  message: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        // Si la connexion réussit, vous pouvez stocker un token ici
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  register(email: string, password: string, name?: string): Observable<boolean> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, { 
      email, 
      password, 
      name 
    }).pipe(
      map(response => true),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
      }
    }
    
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  logout() {
    // Supprime le token et déconnecte l'utilisateur
    localStorage.removeItem('authToken');
  }

  isLoggedIn(): boolean {
    // Vérifie si un token existe
    return !!localStorage.getItem('authToken');
  }
}