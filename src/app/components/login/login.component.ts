import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hidePassword = true;
  isLoading = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute, // <-- Ajoutez ceci
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const email = this.loginForm.get('email')?.value || '';
      const password = this.loginForm.get('password')?.value || '';
  
      this.authService.login(email, password).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Connexion réussie', 'Fermer', { duration: 3000 });
            
            // Récupère l'URL de redirection ou utilise '/'
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          } else {
            this.showError('Échec de la connexion');
          }
        },
        error: (error) => {
          this.showError(error.message);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  private showError(message: string) {
    this.snackBar.open(message, 'Fermer', { 
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    this.isLoading = false;
  }
}