import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Department } from '../models/department.model';
import { AuthService } from './auth.service';
import { Year } from '../models/year.model';


@Injectable({
    providedIn: 'root'
})
export class DepartmentService {

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAllDepartments() {
        return this.http.get<Department[]>(this.authService.basePath + 'api/department/getAllDepartments');
    }
}
