import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'pets',
        loadComponent: () => import('./pages/pets/pets.component').then(m => m.Pets),
        canActivate: [authGuard]
    },
    {
        path: 'pets/register',
        loadComponent: () => import('./pages/pets/register-pet/register-pet').then(m => m.RegisterPet),
        canActivate: [authGuard]
    },
    {
        path: 'pets/update/:id',
        loadComponent: () => import('./pages/pets/update-pet/update-pet').then(m => m.UpdatePet),
        canActivate: [authGuard]
    },
    {
        path: 'pets/:id',
        loadComponent: () => import('./pages/pets/pet-detail/pet-detail.component').then(m => m.PetDetailComponent),
        canActivate: [authGuard]
    },
    {
        path: 'tutors',
        loadComponent: () => import('./pages/tutors/tutors.component').then(m => m.Tutors),
        canActivate: [authGuard]
    },
    {
        path: 'tutors/register',
        loadComponent: () => import('./pages/tutors/register-tutor/register-tutor').then(m => m.RegisterTutor),
        canActivate: [authGuard]
    },
    {
        path: 'tutors/update/:id',
        loadComponent: () => import('./pages/tutors/update-tutors/update-tutors').then(m => m.UpdateTutors),
        canActivate: [authGuard]
    },
    {
        path: 'tutors/:id',
        loadComponent: () => import('./pages/tutors/tutors.component').then(m => m.Tutors),
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
