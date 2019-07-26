import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthGuard } from './_services/auth/auth.guard';
import { LockGuard } from './_services/auth/lock.guard';
import { AdminGuard } from './_services/auth/admin.guard';
import { HomeComponent } from './_viewers/home/home.component';

export const AppRoutes: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    }, {
      path: '',
      component: AdminLayoutComponent,
      canActivate: [AuthGuard, LockGuard],
      children: [
            {
                path: '',
                loadChildren: './dashboard/dashboard.module#DashboardModule'
            }, {
                path: 'administration',
                loadChildren: './administration/administration.module#AdministrationModule',
                canActivate: [AdminGuard]
            }, {
                path: 'manage',
                loadChildren: './manage/manage.module#ManageModule'
            }, {
                path: 'edit',
                loadChildren: './edit/edit.module#EditModule'
            }, {
                path: 'tools',
                loadChildren: './tools/tools.module#ToolsModule'
            }, {
                path: 'view',
                loadChildren: './view/view.module#ViewModule'
            }, {
                path: 'components',
                loadChildren: './components/components.module#ComponentsModule'
            }, {
                path: 'forms',
                loadChildren: './forms/forms.module#Forms'
            }, {
                path: 'tables',
                loadChildren: './tables/tables.module#TablesModule'
            }, {
                path: 'maps',
                loadChildren: './maps/maps.module#MapsModule'
            }, {
                path: 'widgets',
                loadChildren: './widgets/widgets.module#WidgetsModule'
            }, {
                path: 'charts',
                loadChildren: './charts/charts.module#ChartsModule'
            }, {
                path: 'calendar',
                loadChildren: './calendar/calendar.module#CalendarModule'
            }, {
                path: '',
                loadChildren: './userpage/user.module#UserModule'
            }, {
                path: '',
                loadChildren: './timeline/timeline.module#TimelineModule'
            }, {
                path: '',
                loadChildren: './findpage/find.module#FindModule'
            }
        ]
    },{
        path: '',
        component: HomeComponent,
      children: [{
        path: 'pages',
          loadChildren: './_viewers/pages/pages.module#PagesModule'
      }]
    }
];
