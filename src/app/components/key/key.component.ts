import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/select';
import { AppStoreService } from '../../services/app-store.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-key',
  imports: [MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    HeaderComponent
  ],

  templateUrl: './key.component.html',
  styleUrl: './key.component.css'
})
export class KeyComponent implements OnInit {
  keyForm!: FormGroup;

  constructor(private fb: FormBuilder, private appStoreService: AppStoreService) {}

  ngOnInit(): void {
    this.keyForm = this.fb.group({
      userId: ['', Validators.required],
      issuerId: ['', Validators.required],
      apiKey: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.keyForm.valid) {
      this.appStoreService.setCredentials(this.keyForm.value).subscribe({
        next: (response) => console.log('Clés API envoyées', response),
        error: (error) => console.error('Erreur:', error)
      });
    }
  }

  onReset(): void {
    this.keyForm.reset();
  }
}
