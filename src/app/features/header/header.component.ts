// src/app/employee-dashboard/header/header.component.ts
import { Component, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
   imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
   @Input() title: string = 'Employee Dashboard';

  constructor(private authService:AuthService, private router: Router){}

  home(){
    this.router.navigate(['/dashboard']);
  }

  logout(){
    this.authService.logout();
  }
}
