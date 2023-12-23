import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { catchError, Observable, map, throwError, TimeoutError } from 'rxjs';
import { DefaultResponseModel } from '../utils/response.model';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {
    /* TODO document why this constructor is empty */
  }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    let resp = new DefaultResponseModel({
      data: null,
      message: '',
      success: false,
    });

    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof TimeoutError) {
          resp.message = err.message;

          return throwError(() => new RequestTimeoutException(resp));
        } else if (err.response) {
          if (!(err.response instanceof DefaultResponseModel)) {
            resp.message = err.response.message || err.message;
          }

          resp.data = err.response;
          err.response = resp;
        }

        return throwError(() => err);
      }),
      map((val) => {
        if (!(val instanceof DefaultResponseModel)) {
          resp.success = true;
          resp.message = 'Successfully executed the function';

          let body = val;
          if (val instanceof Error) {
            resp.success = false;
            const message = 'Failed when execute the function';
            body = val['response'] ? val['response'] : val.message;

            resp.data = body;
            resp.message = message;
          }

          resp.data = body;
        } else {
          resp = val;
        }

        return resp;
      }),
    );
  }
}
