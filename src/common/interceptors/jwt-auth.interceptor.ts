import {
  ExecutionContext,
  CanActivate,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserJwt } from '../dtos/auth.dto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  constructor() {
    //
  }

  async validateRequest(request: any) {
    const token = request.headers['authorization'];
    if (!token) return false;

    const [auth_type, auth_token] = token.split(' ');

    // check if jwt
    if (auth_type == 'Bearer' && auth_token) {
      const user = jwt.verify(
        auth_token,
        String(process.env.JWT_SECRET || 'test_123A'),
      ) as UserJwt;

      if (!user) throw new UnauthorizedException();

      request.user_id = user.id;
      request.user = user;
      return true;
    }
    return false;
  }
}
