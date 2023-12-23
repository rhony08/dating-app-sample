import {
  ChooseUserRequestDto,
  CreateUserRequestDto,
  LoggedIn,
  LoginUserRequestDto,
  User,
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
   * Retrieves token for login.
   *
   * @param req - The data payload to use for login.
   * @returns A Promise that resolves to a UserResponse object.
   */
  loginUser(req: LoginUserRequestDto): Promise<LoggedIn>;

  /**
   * Upgrade user status to verify.
   *
   * @param user - logged in user
   */
  upgradeUser(user: User): Promise<string>;

  /**
   * Retrieves a single user by ID.
   *
   * @param req - The data payload to use for login.
   * @returns A Promise that resolves to a UserResponse object.
   */
  getUserChoices(user: User): Promise<User[]>;

  /**
   * Retrieves a single user by ID.
   *
   * @param user - Logged-in user.
   * @param body - The data payload to use for choose the user.
   * @returns A Promise that resolves to a string message.
   */
  chooseAUser(user: User, body: ChooseUserRequestDto): Promise<string>;
}

export const IUserService = Symbol('IUserService');
