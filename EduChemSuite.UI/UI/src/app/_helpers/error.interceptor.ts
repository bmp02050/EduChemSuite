import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {StorageService} from "../_services/storage.service";


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(error => {
        if ([401, 403].includes(error.status) && this.storageService.getUser()) {
          // Auto logout if 401 or 403 response returned from API
          this.storageService.logout();
          console.log("Logging out from interceptor");
        }

        const errorMessage = error.error?.message || error.statusText || error;
        return throwError(errorMessage);
      })
    );
  }
}
