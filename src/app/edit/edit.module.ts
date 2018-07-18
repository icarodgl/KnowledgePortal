import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { EditRoutes } from './edit.routing';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { ConceptMapComponent } from './conceptmap/conceptmap.component';
import { SaveMapComponent } from './conceptmap/save/savemap.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EditRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule
  ],
  declarations: [
    ConceptMapComponent,
    SaveMapComponent
  ]
})

export class EditModule {}
