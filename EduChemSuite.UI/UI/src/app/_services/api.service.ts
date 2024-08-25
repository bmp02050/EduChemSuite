import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment.development";
import {UpsertDistrictModel} from "../_models/UpsertDistrictModel";
import {DistrictModel} from "../_models/DistrictModel";


class RegisterModel {
}

@Injectable({providedIn: 'root'})
export class ApiService {
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
  };

  register(user: RegisterModel): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Users/register`, user);
  }

  listMyDistricts(userId: string): Observable<DistrictModel[]>{
    return this.http.get<DistrictModel[]>(`${environment.apiUrl}/api/District/${userId}`, {withCredentials: true});
  }

  listAllDistricts(): Observable<any[]>{
    return this.http.get<any[]>(`${environment.apiUrl}/api/District`, {withCredentials: true});
  }
  upsertDistrict(newDistrict: UpsertDistrictModel): Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/District`, newDistrict, {withCredentials: true});
  }

  registerDistrictUser(): Observable<any>{
    return this.http.post<any>
  }
  //TODO: Add Register New User
  //TODO: Update User

}
