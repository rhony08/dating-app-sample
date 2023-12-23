import { BaseDto, Params } from '../base';

@BaseDto
export class DefaultResponseModel {
  success: boolean;
  message: string;
  data?: any;

  constructor(_: Params<DefaultResponseModel>) {
    // This is intentional
  }
}
