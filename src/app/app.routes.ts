import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TechniciansComponent } from './components/technicians/technicians.component';
import { LoginComponent } from './components/login/login.component';
import { TechnicianDetailComponent } from './components/technician-detail/technician-detail.component';
import { RegisterComponent } from './components/register/register.component';
import { AddKnowledgesComponent } from './components/add-knowledges/add-knowledges.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'buscar', component: TechniciansComponent },
    { path: 'login', component: LoginComponent },
    { path: 'user/:id', component: TechnicianDetailComponent, },
    { path: 'registro', component: RegisterComponent },
    { path: 'agregar-conocimientos', component: AddKnowledgesComponent, canActivate: [AuthGuard] },
    { path: 'tu-cuenta', component: UserInfoComponent, canActivate: [AuthGuard] },
    { path: 'editar-cuenta', component: EditUserComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
