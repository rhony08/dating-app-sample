import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ApmStore } from '../store/apm.store';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  constructor(
    private readonly cfg: ConfigService,
    private readonly apmStore: ApmStore,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    //const req = context.switchToHttp().getRequest();
    //const isFrom = req.is_from != undefined ? req.is_from : 'no-client';
    const handler = context.getHandler();
    const nameRpc = handler.name;
    const apmActive = this.cfg.get<string>('ELASTIC_APM_ACTIVATE') === 'true';

    const transaction = this.apmStore.startTransaction(nameRpc, 'request');
    const span = this.apmStore.startSpan('my-query');

    return next.handle().pipe(
      tap(
        () => {
          if (apmActive) {
            transaction.end();
            span.end();
          }
        },
        (error) => {
          this.apmStore.captureError(new Error(error));
        },
      ),
    );
  }
}
