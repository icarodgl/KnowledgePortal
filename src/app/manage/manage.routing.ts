import { Routes } from '@angular/router';
import { ManageGroupsComponent } from './groups/managegroups.component';

export const ManageRoutes: Routes = [
    {
      path: '',
      children: [{
            path: 'groups',
            children: [
                {
                    path: '',
                    component: ManageGroupsComponent
                }]
        }]
    }
];
