import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Result } from './result/result';
import { Home } from './home/home';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'home', component: Home },
    { path: 'results', component: Result },

];
