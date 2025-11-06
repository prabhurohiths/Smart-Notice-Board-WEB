import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { NoticeListComponent } from './features/notice-list/notice-list.component';
import { NoticePostComponent } from './features/notice-post/notice-post.component';
import { DashbLayoutComponentComponent } from './features/dashboard-layout/dashboard-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // default redirect
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: DashbLayoutComponentComponent, // all pages with header
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'notices', component: NoticeListComponent, canActivate: [AuthGuard] },
      { path: 'post-notice', component: NoticePostComponent, canActivate: [AuthGuard] }
    ]
  },  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
