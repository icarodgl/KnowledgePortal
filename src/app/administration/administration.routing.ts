import { Routes } from '@angular/router';

import { AdminUsersComponent } from './users/adminusers.component';
import { AddUserFormComponent } from './users/add/adduserform.component';


export const AdministrationRoutes: Routes = [
    {
      path: '',
      children: [ {
            path: 'users',
            children: [
                {
                    path: '',
                    component: AdminUsersComponent
                },
                {
                    path: 'add',
                    component: AddUserFormComponent
                }
            ]
        }
       ]}
];
