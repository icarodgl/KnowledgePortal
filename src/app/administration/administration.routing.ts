import { Routes } from '@angular/router';

import { AdminUsersComponent } from './users/adminusers.component';
import { AddUserFormComponent } from './users/add/adduserform.component';
import { AdminMapsComponent } from './maps/adminmaps.component';
import { AdminDashboardComponent } from './dashboard/admindashboard.component';


export const AdministrationRoutes: Routes = [
    {
      path: '',
      children: [ 
        {
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
        },{
            path: 'maps',
            children: [
                {
                    path: '',
                    component: AdminMapsComponent
                }
            ]
        },{
            path: 'dashboard',
            children: [
                {
                    path: '',
                    component: AdminDashboardComponent
                }
            ]
        }]
    }
];
