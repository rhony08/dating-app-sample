import {
  Controller,
  Post,
  Request,
  Body,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { IUserService } from '../services/user.service.interface';
import { SuperLogger } from '../../../common/loggers/logger.service';
import {
  CreateUserRequestDto,
  LoggedIn,
  LoginUserRequestDto,
} from '../dtos/user.dto';
import { Response } from '../../../common/response';

@Controller('app/user')
export class UserController {
  constructor(
    private readonly logger: SuperLogger,
    @Inject(IUserService) private userService: IUserService,
  ) {}

  @Post('register')
  async createUser(
    @Request() _req,
    @Body() body: CreateUserRequestDto,
  ): Promise<Response<number>> {
    const result = await this.userService.createUser(body);

    this.logger.log(
      HttpStatus.OK,
      'CreateUser',
      `Create User Success`,
      'info',
      {
        body,
        method: 'gRPC Method',
        url: 'UserService/CreateUser',
        headers: undefined,
      },
    );

    return new Response<number>(result);
  }

  @Post('login')
  async loginUser(
    @Body() body: LoginUserRequestDto,
  ): Promise<Response<LoggedIn>> {
    const result = await this.userService.loginUser(body);

    this.logger.log(HttpStatus.OK, 'LoginUser', `Login User Success`, 'info', {
      body,
      method: 'gRPC Method',
      url: 'UserService/LoginUser',
      headers: undefined,
    });

    return new Response<LoggedIn>(result);
  }
}
