import { Routes } from '@angular/router';
import { InAppPurchaseComponent } from './components/in-app-purchase/in-app-purchase.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'test', component: InAppPurchaseComponent},
    { path: ':appName', component: InAppPurchaseComponent},
    //{ path : 'Enigmatics', component: InAppPurchaseComponent}

];
