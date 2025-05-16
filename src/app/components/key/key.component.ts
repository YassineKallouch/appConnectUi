import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppStoreService } from '../../services/app-store.service';
import { LogoutComponent } from '../logout/logout.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-key',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    LogoutComponent,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './key.component.html',
  styleUrl: './key.component.css'
})
export class KeyComponent implements OnInit {
  keyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private appStoreService: AppStoreService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.keyForm = this.fb.group({
      userId: ['', Validators.required],
      issuerId: ['', Validators.required],
      apiKey: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.keyForm.valid) {
      const { userId, issuerId, apiKey } = this.keyForm.value;

      this.appStoreService.validateKeys(userId, issuerId, apiKey)
        .subscribe({
          next: (res) => {
            this.router.navigate(['/home']);
          },
          error: (err) => {
            this.snackBar.open("API credentials validation error", 'Close', {
              duration: 4000
            });
          }
        });
    }
  }

  onReset(): void {
    this.keyForm.reset();
  }
}