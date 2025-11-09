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

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    component: DashbLayoutComponentComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'notices', component: NoticeListComponent },
      { 
        path: 'edit-notice/:id', 
        component: NoticeEditComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'TEACHER'] } 
      },
      { 
        path: 'post-notice', 
        component: NoticePostComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'TEACHER'] } 
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
