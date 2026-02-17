import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { HeaderService } from '../../core/services/header.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, BreadcrumbComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashbLayoutComponentComponent implements OnInit {
  headerTitle = 'Hellooo';

  constructor(private headerService: HeaderService) { }

  ngOnInit() {
    this.headerService.currentTitle$.subscribe(title => {
      this.headerTitle = title;
    });
  }
}
