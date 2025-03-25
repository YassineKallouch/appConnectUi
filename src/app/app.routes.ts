import { Routes } from '@angular/router';
import { InAppPurchaseComponent } from './components/in-app-purchase/in-app-purchase.component';

export const routes: Routes = [
    { path: '', component: InAppPurchaseComponent },
    { path: 'test', component: InAppPurchaseComponent},
    { path: 'ok', component: InAppPurchaseComponent}

];
