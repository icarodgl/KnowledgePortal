import { Routes } from '@angular/router';
import { ManageGroupsComponent } from './groups/managegroups.component';
import { AddGroupComponent } from './groups/add/addgroup.component';
import { ManageMapsComponent } from './maps/managemaps.component';

export const ManageRoutes: Routes = [
    {
      path: '',
      children: [{
            path: 'groups',
            children: [
                {
                    path: '',
                    component: ManageGroupsComponent
                },{
                    path:'add',
                    component: AddGroupComponent
                }]
        },{
            path: 'maps',
            component: ManageMapsComponent
        }]
    }
];
