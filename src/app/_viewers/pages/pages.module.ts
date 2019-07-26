import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { FlexLayoutModule } from '@angular/flex-layout';

import { PagesRoutes } from './pages.routing';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from 'app/app.module';
import { RegisterComponent } from './register/register.component';
import { ForgotComponent } from './forgot/forgot.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotComponent,
    LockComponent
  ]
})

export class PagesModule {}
