import { Injectable } from '@nestjs/common';
import * as apm from 'elastic-apm-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApmStore {
  apm: any;

  constructor(private readonly cfg: ConfigService) {
    const isActive = this.cfg.get<string>('ELASTIC_APM_ACTIVATE') === 'true';

    if (isActive) {
      apm.start({
        serviceName: this.cfg.get<string>('ELASTIC_APM_SERVICE_NAME'),
        secretToken: this.cfg.get<string>('ELASTIC_APM_SECRET_TOKEN'),
        serverUrl: this.cfg.get<string>('ELASTIC_APM_SERVER_URL'),
        environment: this.cfg.get<string>('ELASTIC_APM_ENVIRONMENT'),
        captureExceptions: true,
        logLevel: 'info',
      });
    }
    this.apm = apm;
  }

  captureError(data: any) {
    this.apm.captureError(data);
  }

  startTransaction(name: string, type: string) {
    return this.apm.startTransaction(name, type);
  }

  setTransactionName(name) {
    return this.apm.setTransactionName(name);
  }

  startSpan(name: string) {
    return this.apm.startSpan(name);
  }
}
