import { HttpInterceptorFn } from '@angular/common/http';
import { APP_STORAGE_KEYS } from '../constants/app-storage-keys';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem(APP_STORAGE_KEYS.token);
  
  if (token) {
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  
  return next(request);
}; 