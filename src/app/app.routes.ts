import { Routes } from '@angular/router';
import { InAppPurchaseComponent } from './components/in-app-purchase/in-app-purchase.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';
import { DescriptionComponent } from './components/description/description.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { KeyComponent } from './components/key/key.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: KeyComponent },
      //{ path: '', component: HomeComponent },
      { 
        path: ':appName',
        children: [
          { path: '', component: DescriptionComponent },
          { path: 'description', component: DescriptionComponent },
          { path: 'in-app', component: InAppPurchaseComponent },
          { path: 'subscriptions', component: SubscriptionComponent },
          { path: 'availability', component: DescriptionComponent },
          { path: 'pricing', component: DescriptionComponent }

        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];