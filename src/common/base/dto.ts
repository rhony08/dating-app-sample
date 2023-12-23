import { BadRequestException, Logger } from '@nestjs/common';
import { validateSync } from 'class-validator';

export function BaseDto<T extends { new (...args: any[]): {} }>(
  constructor: T,
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super();
      if (args.length > 0) {
        this.validate(args[0]);
      }
    }

    validate<T>(params: Partial<T> | undefined) {
      if (params) {
        this.assign(params);
        this.validateObject();
      }
    }

    assign<T>(params: Partial<T> | undefined) {
      if (params) {
        const _params_keys = Object.keys(params ?? {});
        const _this: any = this;

        const _newvalue: any = params;
        _params_keys.forEach((key) => {
          const value = _newvalue[key];
          _this[key] = value;
        });
      }
    }

    validateObject() {
      const errors = validateSync(this);
      if (errors.length > 0) {
        Logger.error('[ValidationError]', errors.toString());
        throw new BadRequestException(
          ([] as string[]).concat.apply(
            [],
            errors.map((err) => Object.values(err.constraints ?? {})),
          ),
        );
      }
    }
  };
}
