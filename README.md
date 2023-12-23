# Codebase
When working with this file, please install ESLint on your IDE. To ensure the code standard already same. We add typescript-eslint on this codebase, you can check **.eslintrc.js** for the detail of rules. There is also a Dockerfile that need to build the app and run it. This project also includes Postman collection for you to test.

# Table of contents

- [Super-Codebased (gRPC)](#super-codebased-grpc)
- [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Project Structure](#project-structure)
  - [Let’s workarround with Codebase !](#lets-workarround-with-codebase-)
    - [**Class Validator**](#class-validator)
    - [**TypeOrm**](#typeorm)
    - [**Done.**](#done)

## Installation

* Setup .env file with replace file extension **.env.example** to **.env** and fill the env variable as you need.
* You can add env **IS_SEED=true** and **TOTAL_USER_SEED=30** for seeding the user data.
* Please import Dump20231223.sql file to your mysql db.

## Project Structure
├── src
│   ├── app.module.ts
│   ├── common
│   │   ├── consts
│   │   ├── errors
│   │   ├── exceptions
│   │   ├── interceptors
│   │   ├── loggers
│   │   ├── middleware
│   │   ├── pipes
│   │   ├── response
│   │   ├── thirdparties
│   │   │   └── typeorm
│   │   └── utils
│   ├── entities  (description: I'ts optional if you have entities outside the domain of your projects)
│   ├── externals  (description: For consume data from external services via gRPC protocol)
│   │   ├── external.module.ts
│   │   └── voucher
│   │       ├── dtos  (description: Conditional If you need different interface with protobuf generated file pb.ts)
│   │       ├── client
│   │       └── protobuf
│   ├── main.ts
│   └── modules
│       └── super
│           ├── ___fakes __
│           ├──  __specs __
│           ├── controllers
│           │   ├── user.controller.client.ts ( description: Endpoint / Function for consume another services - Service to Service )
│           │   └── user.controller.ts ( description: Endpoint / Function for consume API Gateway )
│           ├── dtos
│           ├── entities
│           ├── protobuf
│           ├── repositories (description: For store data layer. For naming this folder, you can use repositories or models)
│           ├── services  ( description: For store business logic layer )
│           └── app.module.ts
├── Dockerfile
├── README.md
├── bitbucket-pipelines.yml
├── docs
├── nest-cli.json
├── package-lock.json
├── package.json
├── sample_proto
├── tsconfig.build.json
└── tsconfig.json

## Let’s workarround with Codebase !

### **Class Validator**

* * Setup dto with Validator Notation and implement interface from **pb.ts** file was created before.
    * Interface from protobuf generated.

      ```jsx
      export interface CreateUserRequest {
        name: string;
        username: string;
        email: string;
        password: string;
        role_id: number;
        warehouse_id: number;
      }
      ```
    * Create dto

      ```jsx
      export class CreateUserRequestDto implements CreateUserRequest {
        @IsNotEmpty()
        @IsString()
        name: string;

        @IsNotEmpty()
        @IsString()
        username: string;

        @IsNotEmpty()
        @IsString()
        email: string;

        @IsNotEmpty()
        @IsString()
        password: string;

        @IsNotEmpty()
        @IsNumber()
        role_id: number;

        @IsNotEmpty()
        @IsNumber()
        warehouse_id: number;
      }
      ```
    * Implement in Controller

      ```jsx
      @GrpcMethod(USER_SERVICE_NAME, 'UpdateUser')
        async updateUser(
          @Payload() request: UpdateUserRequestDto,
        ): Promise<Response<UserUpdated>> {
          const result = await this.userService.updateUser(request);

          this.logger.log(
            0, //--> gRPC status OK
            'UpdateUser',
            `Update User Success`,
            'info',
            {
              body: request,
              method: 'gRPC Method',
              url: 'UserService/UpdateUser',
              headers: undefined,
            },
          );

          return new Response<UserUpdated>(result);
        }
      ```

### **TypeOrm**

* Implement Runner in Repository

  ```jsx
  async findUserById(id: number, runner?: Runner): Promise<UserEntity> {
      try {
        let entityManager = this.dataSource.manager;
        if (runner) {
          entityManager = runner.manager;
        }

        const data = entityManager
          .createQueryBuilder()
          .select('users')
          .from(UserEntity, 'users')
          .where('users.deleted_at IS NULL')
          .andWhere('users.id = :id', { id });

        if (runner && runner.lock_mode) {
          data.setLock(runner.lock_mode);
        }

        return await data.getOne();
      } catch (err) {
        return Promise.reject(err);
      }
    }
  ```
* Implement runIntranction and lock for Modify Command in Service Layer

  ```jsx
  async updateUser(req: UpdateUserRequestDto): Promise<UserUpdated> {
      try {
        return await runInTransaction(this.dataSource, async (em) => {
          const now = new Date();
          const runner: Runner = {
            manager: em,
            lock_mode: 'pessimistic_write', //--> Lock on the affected row
          };

          const existed = await this.userRepository.findUserById(req.id, runner);
          if (!existed) {
            throw new NotFoundError();
          }

          const updated = Object.assign(new UserEntity(), existed);
          updated.role_id = req.role_id;
          updated.status = req.status;
          updated.updated_at = now;

          if (req.name) {
            updated.name = req.name;
          }

          if (req.username) {
            updated.username = req.username;
          }

          if (req.email) {
            updated.email = req.email;
          }

          if (req.password) {
            updated.password = '';
          }

          const updatedData = await this.userRepository.updateUser(
            updated,
            runner,
          );

          const result: UserUpdated = {
            id: updatedData.id,
            role_id: updatedData.role_id,
            name: updatedData.name,
            username: updatedData.username,
            email: updatedData.email,
            warehouse_id: updatedData.warehouse_id,
          };

          return result;
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }
  ```

### **Implement Custom Error**

* Custom Error (BaseError).  **(src/common/errors/index.ts)**
* List of errors you can use:
  * new ForbiddenError() or new ForbiddenError('message error')
  * new UnauthorizedError() or new UnauthorizedError('message error')
  * new BadRequestError() or new BadRequestError('message error')
  * new NotFoundError() or new NotFoundError('message error')
  * new InternalError() or new InternalError('message error')
  * new UnImplementedError() or new UnImplementedError('message error')
### **Done.**
