import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { AdministrationRoutes } from './administration.routing';
import { AdminUsersComponent } from './users/adminusers.component';
import { AddUserFormComponent } from './users/add/adduserform.component';
import { FieldErrorDisplayComponent } from './users/add/field-error-display/field-error-display.component';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { AdminMapsComponent } from './maps/adminmaps.component';
import { AdminDashboardComponent } from './dashboard/admindashboard.component';
import { MdModule } from '../md/md.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdministrationRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MdModule,
    MaterialModule
  ],
  declarations: [
      AdminUsersComponent,
      AddUserFormComponent,
      AdminMapsComponent,
      AdminDashboardComponent,
      FieldErrorDisplayComponent
  ]
})

export class AdministrationModule {}
