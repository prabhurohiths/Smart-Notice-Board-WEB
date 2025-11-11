import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Department } from '../models/department.model';
import { AuthService } from './auth.service';
import { Year } from '../models/year.model';


@Injectable({
    providedIn: 'root'
})
export class YearService {

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAllYears() {
        return this.http.get<Year[]>(this.authService.basePath + 'api/year/getAllYears');
    }

}
