import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';


@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html'
})
export class StudentDashboardComponent implements OnInit {

  user: User | null = null;

  constructor(private auth: AuthService) { }

  ngOnInit() {
  }
}
