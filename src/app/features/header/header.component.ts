// header.component.ts
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
  @Input() title: string = 'Virtual Notice Board';
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) { }

  home() {
    this.router.navigate(['/app/dashboard']);
  }

  profile() {
    this.router.navigate(['/app/profile']);
  }

  logout() {
    this.authService.logout();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}