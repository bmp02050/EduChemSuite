import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment.development";
import {AuthenticateResponse} from "../_models/AuthenticateResponse";
import {AuthenticateModel} from "../_models/authenticateModel";
import {RefreshTokenRequest} from "../_models/RefreshTokenRequest";

const AUTH_API = `${environment.apiUrl}/api/Auth`;

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {
  }

  login(email: string, password: string): Observable<AuthenticateResponse> {
    let loginUser = new AuthenticateModel();
    loginUser.email = email;
    loginUser.password = password;
    return this.http.post<AuthenticateResponse>(`${environment.apiUrl}/api/Auth/authenticate`, loginUser, httpOptions);
  }

  refreshToken(userId: string, token: string): Observable<AuthenticateResponse> {
    let refreshTokenRequest = new RefreshTokenRequest();
    refreshTokenRequest.refreshToken = token;
    refreshTokenRequest.userId = userId;
    return this.http.post<AuthenticateResponse>(`${environment.apiUrl}/api/Auth/refresh-token`, refreshTokenRequest, httpOptions);
  }

}
