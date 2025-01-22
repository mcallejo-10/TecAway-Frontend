import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica si la URL incluye la del endpoint del backend
  if (req.url.startsWith(environment.endpoint)) {
    console.log('Interceptor está agregando withCredentials=true a la solicitud');

    const modifiedReq = req.clone({
      withCredentials: true
    });
    return next(modifiedReq);
  }

  // Si no es del backend, sigue sin modificar la solicitud
  return next(req);
};
