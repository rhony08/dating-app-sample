import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  Inject,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserService } from '../services/user.service.interface';
import { SuperLogger } from '../../../common/loggers/logger.service';
import {
  ChooseUserRequestDto,
  CreateUserRequestDto,
  LoggedIn,
  LoginUserRequestDto,
  User,
} from '../dtos/user.dto';
import { Response } from '../../../common/response';
import { JwtAuthGuard } from 'src/common/interceptors/jwt-auth.interceptor';

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
        method: 'HTTP Method',
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
      method: 'HTTP Method',
      url: 'UserService/LoginUser',
      headers: undefined,
    });

    return new Response<LoggedIn>(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  async upgradeUser(@Request() req): Promise<Response<string>> {
    const user = req.user;
    const result = await this.userService.upgradeUser(user);

    this.logger.log(
      HttpStatus.OK,
      'UpgradeUser',
      `Upgrade User Success`,
      'info',
      {
        body: null,
        method: 'HTTP Method',
        url: 'UserService/UpgradeUser',
        headers: undefined,
      },
    );

    return new Response<string>(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-choices')
  async userChoices(@Request() req): Promise<Response<User[]>> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException({
        message: 'You should login first!',
      });
    }

    const result = await this.userService.getUserChoices(user);

    this.logger.log(
      HttpStatus.OK,
      'List Choices',
      `Fetch List Choice are Successful`,
      'info',
      {
        body: null,
        method: 'HTTP Method',
        url: 'UserService/UserChoices',
        headers: undefined,
      },
    );

    return new Response<User[]>(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('choose')
  async chooseUser(
    @Request() req,
    @Body() body: ChooseUserRequestDto,
  ): Promise<Response<string>> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException({
        message: 'You should login first!',
      });
    }

    const result = await this.userService.chooseAUser(user, body);

    this.logger.log(HttpStatus.OK, 'chooseUser', `User Choice`, 'info', {
      body,
      method: 'HTTP Method',
      url: 'UserService/UserChoices',
      headers: undefined,
    });

    return new Response<string>(result);
  }
}
