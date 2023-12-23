import { BaseDto, Params } from '../base';

@BaseDto
export class DefaultResponseModel<T> {
  success: boolean;
  message: string;
  data: T;

  constructor(_: Params<DefaultResponseModel<T>>) {
    // This is intentional
  }
}
