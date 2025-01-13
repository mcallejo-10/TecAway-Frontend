import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TechniciansComponent } from './components/technicians/technicians.component';
import { LoginComponent } from './components/login/login.component';
import { TechnicianDetailComponent } from './components/technician-detail/technician-detail.component';
import { RegisterComponent } from './components/register/register.component';
import { AddKnowledgesComponent } from './components/add-knowledges/add-knowledges.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'buscar', component: TechniciansComponent },
    { path: 'login', component: LoginComponent },
    { path: 'user/:id', component: TechnicianDetailComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'agregar-conocimientos', component: AddKnowledgesComponent },
    { path: '***', redirectTo: '', pathMatch:'full' }
];
