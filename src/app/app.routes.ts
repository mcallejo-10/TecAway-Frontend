import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TechniciansComponent } from './components/technicians/technicians.component';
import { LoginComponent } from './components/login/login.component';
import { TechnicianDetailComponent } from './components/technician-detail/technician-detail.component';
import { RegisterComponent } from './components/register/register.component';
import { AddKnowledgesComponent } from './components/add-knowledges/add-knowledges.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { authGuard } from './guards/auth.guard';
import { ContactComponent } from './components/contact/contact.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'buscar', component: TechniciansComponent },
    { path: 'login', component: LoginComponent },
    { path: 'user/:id', component: TechnicianDetailComponent, },
    { path: 'contact-user/:id', component: ContactComponent,},
    { path: 'registro', component: RegisterComponent },
    { path: 'agregar-conocimientos', component: AddKnowledgesComponent, canActivate: [authGuard] },
    { path: 'tu-cuenta', component: UserInfoComponent, canActivate: [authGuard] },
    { path: 'editar-cuenta', component: EditUserComponent, canActivate: [authGuard] },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
