import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';


@Component({
  selector: 'app-teacher-dashboard',
  standalone: false,
  templateUrl: './teacher-dashboard.component.html'
})
export class TeacherDashboardComponent implements OnInit {

  user: User | null = null;

  constructor(private auth: AuthService) { }

  ngOnInit() {
  }
}
