import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { BaseError } from '../errors';
import { Request, LogMessage, LogLevel, CauseErr } from './logger.dto';

@Injectable()
export class SuperLogger {
  private readonly serviceName: string;

  constructor(
    @Inject('NODE_ENV')
    private readonly env: string,

    @Inject('SERVICE_NAME')
    private readonly name: string,

    @Inject(Logger) private readonly logger: LoggerService,
  ) {
    this.env = 'unknown-env';
    if (env) {
      this.env = env;
    }

    this.name = 'unknown-service';
    if (name) {
      this.name = name;
    }

    this.serviceName = `[${env}] ${name}`;
  }

  // For Global Log
  public log(
    code: number,
    event: string,
    message: string,
    level: LogLevel,
    req: Request,
    e?: Error,
  ) {
    const eventService = `[gRPC] ${event}`;
    const lm = this._setLogMessage(level, eventService);
    lm.properties = {
      res: {
        status: code,
        message: message,
      },
      req: req,
    };

    if (e) {
      this._setError(lm, e);
    }

    this.logger.log(JSON.stringify(lm));
  }

  // For Log Catch Error
  public fromTransport(
    trans: 'gRPC' | 'HTTP',
    event: string,
    req: Request,
    level: LogLevel,
    err: Error,
    errCode: number,
  ) {
    const eventService = `[${trans}] ${event}`;
    const lm = this._setLogMessage(level, eventService);
    lm.properties = {
      res: {
        status: errCode,
        message: err.name,
      },
      req: req,
    };
    this._setError(lm, err);
    this.logger.error(JSON.stringify(lm));
  }

  private _setError(lm: LogMessage, err?: Error) {
    if (!err) {
      return;
    }

    lm.properties.err = this._setCauseError(err);
  }

  private _setCauseError(err: Error, cause?: CauseErr): CauseErr {
    if (!cause) {
      cause = {};
    }

    cause = {
      err_message: err.message,
      err_name: err.name,
    };

    if (err.stack && err.stack.length > 0) {
      cause.err_trace = err.stack
        .split('\n')
        .map((line) => line.trim())
        .slice(0, 10);
    }

    if (err instanceof BaseError) {
      const we = err.unwrap();
      if (!we) {
        return cause;
      }

      const nc: CauseErr = {
        err_message: we.message,
        err_name: we.name,
        stack: {},
      };

      if (we.stack && we.stack.length > 0) {
        nc.err_trace = we.stack
          .split('\n')
          .map((line) => line.trim())
          .slice(0, 10);
      }

      cause.stack = this._setCauseError(we, nc);
    }

    return cause;
  }

  private _setLogMessage(lvl: LogLevel, event: string) {
    const lm: LogMessage = {
      timestamp: new Date().toISOString(),
      level: lvl,
      serviceName: this.serviceName,
      responseTime: 0,
      event: event,
    };

    return lm;
  }
}
