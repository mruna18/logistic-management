import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ControlTowerComponent } from './features/control-tower/control-tower.component';
import { ImportOrderListComponent } from './features/import-orders/import-order-list/import-order-list.component';
import { ImportOrderFormComponent } from './features/import-orders/import-order-form/import-order-form.component';
import { ImportOrderDetailComponent } from './features/import-orders/import-order-detail/import-order-detail.component';
import { ShipmentListComponent } from './features/shipments/shipment-list/shipment-list.component';
import { ContainerListComponent } from './features/containers/container-list/container-list.component';
import { ClearanceComponent } from './features/clearance/clearance.component';
import { DeliveryComponent } from './features/delivery/delivery.component';
import { FinanceComponent } from './features/finance/finance.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'dashboard', component: ControlTowerComponent },
      { path: 'import-orders', component: ImportOrderListComponent },
      { path: 'import-orders/new', component: ImportOrderFormComponent },
      { path: 'import-orders/:id', component: ImportOrderDetailComponent },
      { path: 'import-orders/:id/edit', component: ImportOrderFormComponent },
      { path: 'shipments', component: ShipmentListComponent },
      { path: 'shipments/:id', loadComponent: () => import('./features/shipments/shipment-detail/shipment-detail.component').then(m => m.ShipmentDetailComponent) },
      { path: 'containers', component: ContainerListComponent },
      { path: 'clearance', component: ClearanceComponent },
      { path: 'delivery', component: DeliveryComponent },
      { path: 'finance', component: FinanceComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];
