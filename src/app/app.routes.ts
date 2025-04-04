import { Routes } from '@angular/router';
import { InAppPurchaseComponent } from './components/in-app-purchase/in-app-purchase.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
      path: '',
      canActivate: [AuthGuard],
      children: [
        { path: '', component: HomeComponent },
        { path: ':appName', component: InAppPurchaseComponent }
      ]
    },
    { path: '**', redirectTo: '' }
  ];