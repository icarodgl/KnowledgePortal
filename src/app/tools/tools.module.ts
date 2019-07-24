import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { ToolsRoutes } from './tools.routing';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { MapDebateComponent } from './mapdebate/mapdebate.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ToolsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule
  ],
  declarations: [
    MapDebateComponent
  ],
  exports:[MapDebateComponent]
})

export class ToolsModule {}
