import { HttpInterceptorFn } from '@angular/common/http';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    withCredentials: true,
    headers: req.headers.set('Accept', 'application/json')
  });
  return next(modifiedReq);
};