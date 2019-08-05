import { Routes } from '@angular/router';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { RegisterComponent } from './register/register.component';
import { LockGuard } from 'app/_services/auth/lock.guard';
import { AuthGuard } from 'app/_services/auth/auth.guard';
import { NewPasswordComponent } from './newPassword/newPassword.component';

export const PagesRoutes: Routes = [

    {
        path: '',
        children: [ {
            path: 'login',
            component: LoginComponent,
        }, {
            path: 'lock',
            component: LockComponent,
            canActivate: [AuthGuard]
        }, {
            path: 'register',
            component: RegisterComponent,
        }, {
            path: 'forgot',
            component: ForgotComponent,
            },
        {
            path: 'newpassword/:token',
            component: NewPasswordComponent,
        }]
    }
];
