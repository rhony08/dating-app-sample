import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export interface User {
  id: number;
  name: string;
  email: string;
  is_verify: boolean;
}

export interface LoggedIn {
  user: User;
  token: string;
}

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginUserRequestDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
