import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../../services/app-store.service';

@Component({
  selector: 'app-factor',
  templateUrl: './factor.component.html',
  styleUrl: './factor.component.css'
})
export class FactorComponent implements OnInit {
  countries: any[] = [];

  constructor(private appStoreService: AppStoreService) {}

  ngOnInit(): void {
    this.appStoreService.getCountries().subscribe({
      next: (data: any[]) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
      }
    });
  }

  getFactorForCountry(country: any): string {
    if (country.currency === 'USD') {
      return '1.00';
    }
    return 'N/A'
  }
}