import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NoticeListComponent } from './features/notice-list/notice-list.component';
import { NoticePostComponent } from './features/notice-post/notice-post.component';
import { AuthGuard } from './core/guards/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // default redirect
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'notices', component: NoticeListComponent, canActivate: [AuthGuard] },
  { path: 'post-notice', component: NoticePostComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
