import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TechniciansComponent } from './components/technicians/technicians.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'buscar', component: TechniciansComponent },
    { path: 'login', component: LoginComponent },
    {path: '***', redirectTo: '', pathMatch:'full'}
];
