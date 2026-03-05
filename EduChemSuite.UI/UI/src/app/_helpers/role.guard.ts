import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../_services/storage.service';
import { AccountType } from '../_models/AccountType';

export const roleGuard: CanActivateFn = (route) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const user = storageService.getUser();
  if (!user?.accessToken) {
    return router.createUrlTree(['/account/login']);
  }

  const allowedRoles: AccountType[] = route.data?.['roles'] ?? [];
  if (allowedRoles.length === 0) return true;

  if (allowedRoles.includes(user.accountType)) {
    return true;
  }

  return router.createUrlTree(['/welcome']);
};
