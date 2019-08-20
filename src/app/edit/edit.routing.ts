import { Routes } from '@angular/router';
import { ConceptMapComponent } from './conceptmap/conceptmap.component';
import { SaveMapComponent } from './conceptmap/save/savemap.component';


export const EditRoutes: Routes = [
    {
      path: '',
      children: [ {
            path: 'cmap',
            children: [
                {
                    path: '',
                    component: ConceptMapComponent
                },
                {
                    path: 'save',
                    component: SaveMapComponent
                },
                {
                    path: ':id',
                    component: ConceptMapComponent
                }
            ]
        }
       ]}
];
