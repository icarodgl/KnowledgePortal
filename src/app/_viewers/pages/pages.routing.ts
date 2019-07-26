import { Routes } from '@angular/router';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { RegisterComponent } from './register/register.component';
import { LockGuard } from 'app/_services/auth/lock.guard';
import { AuthGuard } from 'app/_services/auth/auth.guard';

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
            path: 'forgot',
            component: ForgotComponent,
            canActivate: [LockGuard]
        }]
    }
];
