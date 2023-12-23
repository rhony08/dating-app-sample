import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ValidationError as NestValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BadRequestError } from '../errors';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const msgs = this.errFormat(errors);
      throw new BadRequestError('Invalid Request', msgs);
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private errFormat(errors: NestValidationError[]): string[] {
    const msgs: string[] = [];

    errors.map((err) => {
      if (err.children.length > 0) {
        msgs.push(...this.errFormat(err.children));
      } else {
        msgs.push(...Object.values(err.constraints));
      }
    });

    return msgs;
  }
}
