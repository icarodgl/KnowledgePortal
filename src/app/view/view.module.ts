import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { ViewRoutes } from './view.routing';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { ViewMapComponent } from './map/viewmap.component';
import { ViewMapVersionsComponent } from './map/versions/viewmapversions.component';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ViewRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [
    ViewMapComponent,
    ViewMapVersionsComponent
  ]
})

export class ViewModule {}
