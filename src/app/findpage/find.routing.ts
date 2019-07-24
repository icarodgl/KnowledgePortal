import { Routes } from '@angular/router';

import { FindComponent } from './find.component';

export const FindRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: 'pages/find',
        component: FindComponent
    },{
        path: 'pages/find/:search',
        component: FindComponent
    }]
}
];
