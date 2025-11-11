import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Department } from '../models/department.model';
import { AuthService } from './auth.service';
import { Year } from '../models/year.model';
import { Role } from '../models/role.model';

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAllRoles() {
        return this.http.get<Role[]>(this.authService.basePath + 'api/role/getAllRoles');
    }
}
