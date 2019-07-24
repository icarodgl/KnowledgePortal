import { Routes } from '@angular/router';
import { MapDebateComponent } from './mapdebate/mapdebate.component';


export const ToolsRoutes: Routes = [
    {
      path: '',
      children: [ {
            path: 'mapdb',
            children: [
                {
                    path: '',
                    component: MapDebateComponent
                }
            ]
        }
       ]}
];
