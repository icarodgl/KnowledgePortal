import { Routes } from '@angular/router';
import { ConceptMapComponent } from './conceptmap/conceptmap.component';


export const EditRoutes: Routes = [
    {
      path: '',
      children: [ {
            path: 'cmap',
            children: [
                {
                    path: '',
                    component: ConceptMapComponent
                }
            ]
        }
       ]}
];
