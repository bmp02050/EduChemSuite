import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { AuthService } from '../_services/auth.service';
import { EventBusService } from './event-bus.service';
import {EventData} from "./event.class";

// Create a shared state object to manage `isRefreshing`
const refreshState = { isRefreshing: false };

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  const eventBusService = inject(EventBusService);

  const user = storageService.getUser();
  console.log('Interceptor invoked');
  const token = user.accessToken;

  if (token) {
    const clonedRequest = req.clone({
      withCredentials: true,
      setHeaders: {
        Authorization: user && user.accessToken ? `Bearer ${user.accessToken}` : ''
      }
    });

    return next(clonedRequest).pipe(
      catchError((error: any) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('Auth/authenticate') &&
          error.status === 401
        ) {
          console.log("Start handling error")
          return handle401Error(req, next, storageService, authService, eventBusService);
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};

// Refactored handle401Error function
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  storageService: StorageService,
  authService: AuthService,
  eventBusService: EventBusService
) {
  if (!refreshState.isRefreshing) {
    refreshState.isRefreshing = true;
    if (storageService.isLoggedIn()) {
      const user = storageService.getUser();
      return authService.refreshToken(user.id, user.refreshToken).pipe(
        switchMap((refreshResponse) => {
          refreshState.isRefreshing = false;

          // Save the updated user data after successful refresh token
          storageService.saveUser(refreshResponse);

          // Continue with the original request with updated authorization header
          const clonedRequest = request.clone({
            withCredentials: true,
            setHeaders: {
              Authorization: refreshResponse.accessToken ? `Bearer ${refreshResponse.accessToken}` : ''
            }
          });

          return next(clonedRequest);
        }),
        catchError((error) => {
          refreshState.isRefreshing = false;

          if (error.status === 403) {
            eventBusService.emit(new EventData('logout', null));
          }

          return throwError(() => error);
        })
      );
    }
  }

  return next(request);
}
