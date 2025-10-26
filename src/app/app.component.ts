import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router,) { }

  ngOnInit(): void {
  }

}
