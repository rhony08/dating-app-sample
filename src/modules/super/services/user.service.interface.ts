import {
  CreateUserRequestDto,
  LoggedIn,
  LoginUserRequestDto,
} from '../dtos/user.dto';

export interface IUserService {
  /**
   * Creates a new user with the given payload data.
   *
   * @param payloads - The data payload to use for creating the new user.
   * @returns A Promise that resolves to the ID of the new user.
   */
  createUser(req: CreateUserRequestDto): Promise<number>;

  /**
   * Retrieves a single user by ID.
   *
   * @param req - The data payload to use for login.
   * @returns A Promise that resolves to a UserResponse object.
   */
  loginUser(req: LoginUserRequestDto): Promise<LoggedIn>;
}

export const IUserService = Symbol('IUserService');
