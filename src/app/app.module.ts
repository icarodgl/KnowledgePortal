import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { APP_BASE_HREF } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { AppComponent } from './app.component';

import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { FixedpluginModule} from './shared/fixedplugin/fixedplugin.module';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';

import { AppRoutes } from './app.routing';
import { AuthService } from './_services/auth/auth.service';
import { AuthGuard } from './_services/auth/auth.guard';
import { LockGuard } from './_services/auth/lock.guard';
import { AdminGuard } from './_services/auth/admin.guard';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserService, MapService, VersionService, MeService, ModelService, GroupService } from './_services/index.service';
import { JwtInterceptor } from './_services/auth/jwt.interceptor';
import { FollowService } from './_services/follow/follow.service';
import { SpeechRecognitionModule } from './speech2map/speech-recognition.module';
import { SpeechRecognitionComponent } from './speech2map/speech-recognition.component';
import { SpeechRecognitionService } from './_services/speech2map/speech-recognition.service';
import { SidebarService } from './_services/sidebar/sidebar.service';
import { WebsocketService } from './_services/websocket/websocket.service';
import { SocketService } from './_services/socketservice/socket.service';
import { HomeComponent } from './_viewers/home/home.component';
import { SharedService } from './_services/shared.service';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}

@NgModule({
    imports:      [
        CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes),
        HttpModule,
        MaterialModule,
        MatNativeDateModule,
        SidebarModule,
        NavbarModule,
        FooterModule,
        FixedpluginModule,
        HttpClientModule,
        SpeechRecognitionModule,

    ],entryComponents: [
      SpeechRecognitionComponent
    ],

    declarations: [
        AppComponent,
        AdminLayoutComponent,
        HomeComponent,
    ],
    providers: [
      AuthService, 
      AuthGuard, 
      UserService,
      MapService,
      ModelService,
      VersionService,
      FollowService,
      MeService,
      LockGuard,
      AdminGuard,
      SidebarService,
      SpeechRecognitionService,
      GroupService,
      WebsocketService,
      SharedService,
      SocketService,
      CookieService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: JwtInterceptor,
        multi: true
      }
    ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }
