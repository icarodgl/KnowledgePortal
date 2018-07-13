import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { PricingComponent } from './pricing/pricing.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { LockGuard } from '../_services/auth/lock.guard';
import { AuthGuard } from '../_services/auth/auth.guard';

export const PagesRoutes: Routes = [

    {
        path: '',
        children: [ {
            path: 'login',
            component: LoginComponent,
            canActivate: [LockGuard]
        }, {
            path: 'lock',
            component: LockComponent,
            canActivate: [AuthGuard]
        }, {
            path: 'register',
            component: RegisterComponent,
            canActivate: [LockGuard]
        }, {
            path: 'pricing',
            component: PricingComponent
        }]
    }
];
