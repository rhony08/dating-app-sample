import { Scenario } from '../../../common/utils/scenario.test';
import { IUserRepository } from '../repositories/user.repo.interface';
import { UserService } from '../services/user.service';
import { IUserService } from '../services/user.service.interface';
import { Test } from '@nestjs/testing';
import { NotFoundError, UnauthorizedError } from '../../../common/errors';
import { DataSource } from 'typeorm';
import { IUserChoiceRepository } from '../repositories/user-choice.repo.interface';
import { genSaltSync, hashSync } from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

function generatePassword(password: string): string {
  const salt = genSaltSync(10);

  return hashSync(password, salt);
}

describe('User Service Test', () => {
  const mockUserRepository: IUserRepository = {
    createUser: jest.fn(),
    findUserById: jest.fn(),
    findUserByMail: jest.fn(),
    findUserToChoose: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockUserChoiceRepository: IUserChoiceRepository = {
    createUserChoice: jest.fn(),
    findAllUserChoiceToday: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn().mockReturnThis(),
      startTransaction: jest.fn().mockReturnThis(),
      commitTransaction: jest.fn().mockReturnThis(),
      rollbackTransaction: jest.fn().mockReturnThis(),
      release: jest.fn().mockReturnThis(),
      manager: jest.fn().mockReturnThis(),
      lock_mode: jest.fn().mockReturnThis(),
    })),
  };

  // Init Testing Module
  let userService: IUserService;
  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [],
      providers: [
        UserService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: IUserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: IUserChoiceRepository,
          useValue: mockUserChoiceRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = testModule.get<IUserService>(UserService);
  });

  describe('loginUser Function', () => {
    //Setup List of scenario Test Cases
    const password = generatePassword('123123');
    const userEntity = new UserEntity();
    userEntity.email = 'a@b.c';
    userEntity.password = '123123';

    const userEntityValidPwd = { ...userEntity };
    userEntityValidPwd.password = password;

    const scenarios: Scenario[] = [
      {
        name: '[NEGATIVE] should be return Not Found Error',
        request: { email: '', password },
        expectedValue: undefined,
        expectedErrors: new NotFoundError('User Tidak ditemukan'),
      },
      {
        name: '[NEGATIVE] found but invalid password',
        request: { email: 'a@b.c', password: '123123' },
        expectedValue: undefined,
        expectedErrors: new UnauthorizedError(
          'Email/Password yang dimasukkan tidak benar',
        ),
      },
      {
        name: '[POSITIVE] should be return user information',
        request: { email: 'a@b.c', password: '123123' },
        expectedValue: 'a@b.c',
      },
    ];

    it(scenarios[0].name, async () => {
      await expect(userService.loginUser(scenarios[0].request)).rejects.toEqual(
        scenarios[0].expectedErrors,
      );
    });

    it(scenarios[1].name, async () => {
      jest
        .spyOn(mockUserRepository, 'findUserByMail')
        .mockResolvedValueOnce(userEntity);

      await expect(userService.loginUser(scenarios[1].request)).rejects.toEqual(
        scenarios[1].expectedErrors,
      );
    });

    it(scenarios[2].name, async () => {
      jest
        .spyOn(mockUserRepository, 'findUserByMail')
        .mockResolvedValueOnce(userEntityValidPwd);

      const resp = await userService.loginUser(scenarios[2].request);
      expect(resp.user.email).toEqual(scenarios[2].expectedValue);
    });
  });

  describe('getUserChoices Function', () => {
    //Setup List of scenario Test Cases
    const userEntityVerified = new UserEntity();
    userEntityVerified.is_verify = 1;

    const userEntityNotVerified = new UserEntity();
    userEntityNotVerified.is_verify = 0;

    const scenarios: Scenario[] = [
      {
        name: '[POSITIVE] should be return the data - verified after logged-in',
        request: { id: 1, is_verify: false },
        expectedValue: {
          id: 2,
          is_verify: true,
          name: 'budi',
        },
      },
      {
        name: '[POSITIVE] should be return empty array',
        request: { id: 1, is_verify: false },
        expectedValue: [],
      },
      {
        name: '[POSITIVE] should be return the data - verified before logged-in',
        request: { id: 1, is_verify: true },
        expectedValue: {
          id: 2,
          is_verify: true,
          name: 'budi',
        },
      },
    ];

    it(scenarios[0].name, async () => {
      jest
        .spyOn(mockUserRepository, 'findUserById')
        .mockResolvedValueOnce(userEntityVerified);
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
      jest.spyOn(mockUserRepository, 'findUserToChoose').mockResolvedValueOnce([
        {
          id: 2,
          email: '',
          is_verify: true,
          name: 'budi',
        },
      ]);

      const resp = await userService.getUserChoices(scenarios[0].request);
      expect(resp[0]).toEqual(
        expect.objectContaining(scenarios[0].expectedValue),
      );
    });

    it(scenarios[1].name, async () => {
      jest
        .spyOn(mockUserRepository, 'findUserById')
        .mockResolvedValueOnce(userEntityNotVerified);
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

      const resp = await userService.getUserChoices(scenarios[0].request);
      expect(resp).toEqual([]);
    });

    it(scenarios[2].name, async () => {
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
      jest.spyOn(mockUserRepository, 'findUserToChoose').mockResolvedValueOnce([
        {
          id: 2,
          email: '',
          is_verify: true,
          name: 'budi',
        },
      ]);

      const resp = await userService.getUserChoices(scenarios[2].request);
      expect(resp[0]).toEqual(
        expect.objectContaining(scenarios[2].expectedValue),
      );
    });
  });

  describe('chooseAUser Function', () => {
    //Setup List of scenario Test Cases

    const userEntityNotVerified = new UserEntity();
    userEntityNotVerified.is_verify = 0;

    const scenarios: Scenario[] = [
      {
        name: '[NEGATIVE] should be throw an error - choose his/her ownself',
        request: [
          { id: 1, is_verify: false },
          { chosen_user_id: 1, status: 1 },
        ],
        expectedValue: undefined,
        expectedErrors: new BadRequestException({
          message: 'You cant swipe to yourself',
        }),
      },
      {
        name: '[NEGATIVE] already swipe for those user',
        request: [
          { id: 1, is_verify: false },
          { chosen_user_id: 2, status: 1 },
        ],
        expectedValue: undefined,
        expectedErrors: new BadRequestException({
          message: 'You cant swipe same user twice at the same day!',
        }),
      },
      {
        name: '[NEGATIVE] already used all of quota',
        request: [
          { id: 1, is_verify: false },
          { chosen_user_id: 2, status: 1 },
        ],
        expectedValue: undefined,
        expectedErrors: new BadRequestException({
          message:
            'You have used all of your quota! Please upgrade or try tomorrow!',
        }),
      },
      {
        name: '[POSITIVE] should be return success message',
        request: [
          { id: 1, is_verify: true },
          { chosen_user_id: 2, status: 1 },
        ],
        expectedValue: 'Successfully chose the user',
      },
    ];

    it(scenarios[0].name, async () => {
      await expect(
        userService.chooseAUser(
          scenarios[0].request[0],
          scenarios[0].request[1],
        ),
      ).rejects.toEqual(scenarios[0].expectedErrors);
    });

    it(scenarios[1].name, async () => {
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([2]);
      await expect(
        userService.chooseAUser(
          scenarios[1].request[0],
          scenarios[1].request[1],
        ),
      ).rejects.toEqual(scenarios[1].expectedErrors);
    });

    it(scenarios[2].name, async () => {
      jest
        .spyOn(mockUserRepository, 'findUserById')
        .mockResolvedValueOnce(userEntityNotVerified);
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

      await expect(
        userService.chooseAUser(
          scenarios[2].request[0],
          scenarios[2].request[1],
        ),
      ).rejects.toEqual(scenarios[2].expectedErrors);
    });

    it(scenarios[3].name, async () => {
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(mockUserChoiceRepository, 'findAllUserChoiceToday')
        .mockResolvedValueOnce([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

      await expect(
        userService.chooseAUser(
          scenarios[3].request[0],
          scenarios[3].request[1],
        ),
      ).resolves.toEqual(scenarios[3].expectedValue);
    });
  });
});
