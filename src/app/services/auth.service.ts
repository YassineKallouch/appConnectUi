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
        // Modification pour gérer la réponse sans token
        if (response.message === "Connexion réussie") {
          // Stockez un token fictif ou implémentez JWT
          localStorage.setItem('authToken', 'mock-token');
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
    // Supprime le token et déconnecte l'utilisateur
    localStorage.removeItem('authToken');
  }

  isLoggedIn(): boolean {
    // Vérifie si un token existe
    return !!localStorage.getItem('authToken');
  }
}