import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { AuthService } from '../_services/auth.service';
import { EventBusService } from './event-bus.service';
import { EventData } from './event.class';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  const eventBusService = inject(EventBusService);

  const user = storageService.getUser();
  const token = user?.accessToken;

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: any) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('Auth/authenticate') &&
        !req.url.includes('Auth/refresh-token')
      ) {
        return handle401Error(req, next, storageService, authService, eventBusService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    withCredentials: true,
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  storageService: StorageService,
  authService: AuthService,
  eventBusService: EventBusService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const user = storageService.getUser();
    if (!user?.refreshToken) {
      isRefreshing = false;
      eventBusService.emit(new EventData('logout', null));
      return throwError(() => new Error('No refresh token available'));
    }

    return authService.refreshToken(user.id, user.refreshToken).pipe(
      switchMap((response) => {
        isRefreshing = false;
        storageService.saveUser(response);
        refreshTokenSubject.next(response.accessToken!);
        return next(addToken(request, response.accessToken!));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        eventBusService.emit(new EventData('logout', null));
        return throwError(() => error);
      })
    );
  }

  // A refresh is already in progress — wait for the new token, then retry
  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(addToken(request, token!)))
  );
}
