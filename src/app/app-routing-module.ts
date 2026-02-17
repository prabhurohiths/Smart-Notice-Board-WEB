import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { NoticeListComponent } from './features/notice-list/notice-list.component';
import { NoticePostComponent } from './features/notice-post/notice-post.component';
import { DashbLayoutComponentComponent } from './features/dashboard-layout/dashboard-layout.component';
import { NoticeEditComponent } from './features/notice-edit/notice-edit.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { AddUserComponent } from './features/add-user/add-user.component';
import { ManageUsersComponent } from './features/manage-user/manage-users.component';
import { EditUserComponent } from './features/edit-user/edit-user.component';
import { ProfileComponent } from './features/profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [AuthGuard] },

  {
    path: 'app',
    component: DashbLayoutComponentComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Dashboard' },
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'  // Load Dashboard by default
      },

      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { breadcrumb: null }
      },
      
      {
        path: 'profile',
        component: ProfileComponent,
        data: { breadcrumb: 'Profile' },
        canActivate: [AuthGuard]
      },

      {
        path: 'post-notice',
        component: NoticePostComponent,
        data: { breadcrumb: 'Post Notice', roles: ['ADMIN', 'TEACHER'] },
        canActivate: [AuthGuard],
      },

      {
        path: 'notices',
        data: { breadcrumb: 'Notices' },
        children: [
          {
            path: '',
            component: NoticeListComponent,
            pathMatch: 'full',
            data: { breadcrumb: null }
          },
          {
            path: 'edit-notice/:id',
            component: NoticeEditComponent,
            data: { breadcrumb: 'Edit Notice', roles: ['ADMIN', 'TEACHER'] },
            canActivate: [AuthGuard],
          }
        ]
      },

      {
        path: 'add-user',
        component: AddUserComponent,
        data: { breadcrumb: 'Add User', roles: ['ADMIN'] },
        canActivate: [AuthGuard],
      },

      {
        path: 'manage-users',
        data: { breadcrumb: 'Manage Users', roles: ['ADMIN'] },
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            component: ManageUsersComponent,
            pathMatch: 'full',
            data: { breadcrumb: null }
          },
          {
            path: 'edit-user/:id',
            component: EditUserComponent,
            data: { breadcrumb: 'Edit User', roles: ['ADMIN'] },
            canActivate: [AuthGuard],
          }
        ]
      }

    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
