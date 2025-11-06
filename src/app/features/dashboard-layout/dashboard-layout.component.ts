// auth-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashbLayoutComponentComponent implements OnInit {
  headerTitle = 'Hellooo';

  constructor(private headerService: HeaderService) {}

  ngOnInit() {
    this.headerService.currentTitle$.subscribe(title => {
      this.headerTitle = title;
    });
  }
}
