import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User | null = null;
  role: string = '';

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.user = this.auth.getLoggedUser();
    this.role = this.user?.roles[0].name || '';
  }

}
