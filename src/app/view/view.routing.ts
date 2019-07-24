import { Routes } from '@angular/router';
import { ViewMapComponent } from './map/viewmap.component';
import { ViewMapVersionsComponent } from './map/versions/viewmapversions.component';


export const ViewRoutes: Routes = [
    {
      path: '',
      redirectTo: '/view/map',
      pathMatch: 'full'
    },
    {
      path: '',
      children: [{
            path: 'map',
            children:[
              {
                path:'',
                component: ViewMapComponent
              },
              {
                path: 'versions',
                component: ViewMapVersionsComponent
              }
            ]
        }
      ]
    }
];
