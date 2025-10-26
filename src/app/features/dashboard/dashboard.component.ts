import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  user: User | null = null;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    console.log("user - ", this.auth.getLoggedUser())
    this.user = this.auth.getLoggedUser();
  }
}
