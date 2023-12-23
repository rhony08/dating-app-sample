import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsEmail,
} from 'class-validator';
import { BaseDto } from 'src/common/base';

@BaseDto
export class User {
  id: number;
  name: string;
  email: string;
  is_verify: boolean;

  constructor(_: Partial<User>) {}
}

export interface LoggedIn {
  user: User;
  token: string;
}

export enum UserAction {
  PASS = 0,
  LIKE = 1,
}

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginUserRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ChooseUserRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  chosen_user_id: number;

  @IsNotEmpty()
  @IsEnum(UserAction)
  status: number;
}
