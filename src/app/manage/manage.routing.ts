import { Routes } from '@angular/router';
import { ManageGroupsComponent } from './groups/managegroups.component';
import { AddGroupComponent } from './groups/add/addgroup.component';

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
        }]
    }
];
