# Super-Codebased (gRPC)

# Table of contents

- [Super-Codebased (gRPC)](#super-codebased-grpc)
- [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Project Structure](#project-structure)
  - [Let’s workarround with Codebase !](#lets-workarround-with-codebase-)
    - [**Code Pattern**](#code-pattern)
    - [**Work with proto files ( gRPC )**](#work-with-proto-files--grpc-)
    - [**Class Validator**](#class-validator)
    - [**TypeOrm**](#typeorm)
    - [**Implement Custom Error**](#implement-custom-error)
    - [**Implement Logger (SRE - Standard)**](#implement-logger-sre---standard)
    - [**Integrate gRPC service with gateway (dashboard)**](#integrate-grpc-service-with-gateway-dashboard)
    - [**Pipeline Guidelines**](#pipeline-guidelines)
    - [**Done.**](#done)

## Installation

* Setup .env file with replace file extension **.env.example** to **.env** and fill the env variable as you need.
* Register OS env (for install super-protos package)
  *`export CODEARTIFACT_AUTH_TOKEN= `*
* run command for install package
  `CODEARTIFACT_AUTH_TOKEN=$CODEARTIFACT_AUTH_TOKEN npm install`

## Project Structure

├── helm (description: For setup deployment. SRE setup)
│   ├── Chart.yaml
│   ├── templates
│   │   ├── _helpers.tpl
│   │   ├── deployment.yaml
│   │   ├── secrets.yaml
│   │   └── service.yaml
│   └── values.yaml
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
│           └── super.module.ts
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

### **Code Pattern**

![1690462064217](image/README/1690462064217.png)

### **Work with proto files ( gRPC )**

* Create **.proto** file, example:

```protobuf
syntax = "proto3";
package user;

service UserService {
  rpc CreateUser (CreateUserRequest) returns (CreateUserResponse){}
  rpc UpdateUser (UpdateUserRequest) returns (UpdateUserResponse){}
}

message CreateUserRequest {
  string name = 1;
  string username = 2;
  string email = 3;
  string password = 4;
  int32 role_id = 5;
  int32 warehouse_id = 6;
}

message CreateUserResponse {
  string status = 1;
  string message = 2;
  int32 result = 3;
}

message UpdateUserRequest {
  int32 id = 1;
  int32 role_id = 2;
  int32 is_partner = 3;
  string name = 4;
  string username = 5;
  string email = 6;
  string password = 7;
  int32 status = 8;
  int32 warehouse_id = 9;
}

message UpdateUserResponse {
  string status = 1;
  string message = 2;
  UserUpdated result = 3;
}

message UserUpdated {
  int32 id = 1;
  int32 role_id = 2;
  string name = 3;
  string username = 4;
  string email = 5;
  int32 warehouse_id = 6;
}
```

* Upload into super-protos Repo.  **Link repo** : [Super-Protos Repo](https://bitbucket.org/aplikasisuper/super-protos/src/master/?search_id=4a06968e-4044-450c-bbe9-e474fbf9cf61)
* Create Scripts npm in **package.json** for generate File Interface ( **pb.ts file** )

```jsx
"proto:install": "npm i @super/super-protos",
"proto:user": "protoc --plugin=node_modules/.bin/protoc-gen-ts_proto -I=./node_modules/@super/super-protos/proto --ts_proto_out=src/modules/super/protobuf/ node_modules/@super/super-protos/proto/user.proto --ts_proto_opt=nestJs=true --ts_proto_opt=fileSuffix=.pb --ts_proto_opt=snakeToCamel=false",
```

**proto:install** : For install super-protos package into node_modules project.

**proto:user** : For generate File pb.ts

* **Proto interfaces ready for use** .

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

### **Implement Logger (SRE - Standard)**

* Custom Log. ( **src/common/loggers/logger.service.ts** )
* Using Common Log

  ```jsx
  @GrpcMethod(USER_SERVICE_NAME, 'CreateUser')
    async createUser(
      @Payload() request: CreateUserRequestDto,
    ): Promise<Response<number>> {
      const result = await this.userService.createUser(request);

      this.logger.log(
        0, //--> gRPC status OK
        'CreateUser',
        `Create User Success`,
        'info',
        {
          body: request,
          method: 'gRPC Method',
          url: 'UserService/CreateUser',
          headers: undefined,
        },
      );

      return new Response<number>(result);
    }
  ```

  Output Log:

  ```json
  {
      "timestamp": "2023-07-27T06:08:10.871Z",
      "level": "info",
      "serviceName": "[development] Super Service",
      "responseTime": 0,
      "event": "[gRPC] CreateUser",
      "properties": {
          "res": {
              "status": 0,
              "message": "Create User Success"
          },
          "req": {
              "body": {
                  "name": "test user",
                  "username": "user-test",
                  "email": "test@super.co.id",
                  "password": "123123",
                  "role_id": 1,
                  "warehouse_id": 1
              },
              "method": "gRPC Method",
              "url": "UserService/CreateUser"
          }
      }
  }
  ```
* Using Error Log

  * throw error (custom error)
    ```tsx
    async getUserById(id: number): Promise<User> {
        try {
          const data = await this.userRepository.findUserById(id);
          if (!data) {
            throw new NotFoundError();
          }

          const testPromo = await this.voucherClient.getPromoProductByPromoId(1);
          if (!testPromo) {
            throw new NotFoundError();
          } else {
            console.info('Test Data Promo:', JSON.stringify(testPromo));
          }

          const result: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            username: data.username,
            role_id: data.role_id,
            warehouse_id: data.warehouse_id,
          };

          return result;
        } catch (err) {
          return Promise.reject(err);
        }
      }
    ```
  * Exception Filter Handled ( **src/common/exception/grpc.exception.filter.ts** )
  * Output Log:
    ```json
    {
        "timestamp": "2023-07-27T06:13:21.838Z",
        "level": "error",
        "serviceName": "[development] Super Service",
        "responseTime": 0,
        "event": "[gRPC] FindUserById",
        "properties": {
            "res": {
                "status": 5,
                "message": "NotFoundError"
            },
            "req": {
                "method": "",
                "url": "/userclient.UserClientService/FindUserById",
                "body": {
                    "userid": 9999
                },
                "headers": {
                    "user-agent": [
                        "grpc-node-js/1.8.10"
                    ]
                }
            },
            "err": {
                "err_message": "",
                "err_name": "NotFoundError",
                "err_trace": [
                    "NotFoundError:",
                    "at Impl_UserService.getUserById (/home/super-zico/Workspace/codebase/super-rpc-nest/src/modules/super/services/user.service.ts:30:15)",
                    "at processTicksAndRejections (node:internal/process/task_queues:95:5)",
                    "at UserClientController.findUserById (/home/super-zico/Workspace/codebase/super-rpc-nest/src/modules/super/controller/user.controller.client.ts:24:20)",
                    "at /home/super-zico/Workspace/codebase/super-rpc-nest/node_modules/@nestjs/microservices/context/rpc-proxy.js:11:32",
                    "at Object.FindUserById (/home/super-zico/Workspace/codebase/super-rpc-nest/node_modules/@nestjs/microservices/server/server-grpc.js:148:40)"
                ]
            }
        }
    }
    ```
* **Externals - Consume data from another service via gRPC protocol**

  * Setup folder voucher service as client service inside external folder. **(src/externals)**

    ![1690506287524](image/README/1690506287524.png)
  * Generate file contract from proto file

    * Add command script install proto file voucher client service

      ```json
      "proto:install": "npm i @super/super-protos",
      "proto:voucher": "protoc --plugin=node_modules/.bin/protoc-gen-ts_proto -I=./node_modules/@super/super-protos/proto/voucher --ts_proto_out=src/externals/voucher/protobuf/ node_modules/@super/super-protos/proto/voucher/promo.proto --ts_proto_opt=nestJs=true --ts_proto_opt=fileSuffix=.pb --ts_proto_opt=snakeToCamel=false"
      ```
    * File contract from proto file generated

      ![1690506310807](image/README/1690506310807.png)
  * Copy contract (interface) voucher repository and create contract (interface) for voucher client service. **voucher.client.interface.ts**

    ```tsx
    import { PromoProductResponse } from '../protobuf/promo.pb';

    export interface VoucherClient {
      /**
       *
       * @param id: Promo ID
       * @description Get Promo Product list By Promo ID
       * @events
       * - detailOrder() - gRPC
       */
      getPromoProductByPromoId(id: number): Promise<PromoProductResponse[]>;
    }

    export const VoucherClient = Symbol('VoucherClient');
    ```
  * Implement contract voucher client service and init connection to voucher service via gRPC. **voucher.client.ts**

    ```tsx
    @Injectable()
    export class Impl_VoucherClient implements VoucherClient, OnModuleInit {
      private voucherSvc: PromoServiceClient;
      private voucherCLient: ClientGrpc;

      public onModuleInit(): void {
        // init gRPC Connection
        this.voucherCLient = new ClientGrpcProxy({
          package: [PROMO_PACKAGE_NAME],
          url: process.env.VOUCHER_CLIENT_SERVICE,
          protoPath: [
            join(
              __dirname,
              '../../../../node_modules/@super/super-protos/proto/voucher/promo.proto',
            ),
          ],
          keepalive: {
            keepaliveTimeMs: 20000, //20 seconds
            keepaliveTimeoutMs: 240000, //4 Minutes
          },
          loader: {
            keepCase: true,
            longs: Number,
            enums: String,
            defaults: false,
            arrays: true,
            objects: true,
            includeDirs: [
              join(
                __dirname,
                '../../../../node_modules/@super/super-protos/proto/voucher',
              ),
            ],
          },
        });

        //Init Service Instance
        this.voucherSvc =
          this.voucherCLient.getService<PromoServiceClient>(PROMO_SERVICE_NAME);
      }

      async getPromoProductByPromoId(id: number): Promise<PromoProductResponse[]> {
        //Prepare contract response
        const result = new Array<PromoProductResponse>();

        //Prepare request params
        const req: number[] = [id];
        const params: PromoIdsRequest = {
          is_from: 'dashboard',
          promo_ids: req,
        };
        // Call Client Service (gRPC)
        const resultVoucher = await firstValueFrom(
          this.voucherSvc.findPromoProductByPromoId(params),
        );

        // Construct Result as contract response
        if (resultVoucher && resultVoucher.result.length > 0) {
          Object.assign(result, { ...resultVoucher.result });
        }

        return result;
      }
    }
    ```
  * Setup Service Voucher into **external.module.ts**

    ```tsx
    @Module({
      imports: [ConfigModule, LoggerModule],
      exports: [VoucherClient],
      providers: [
        {
          provide: VoucherClient,
          useClass: Impl_VoucherClient,
        },
      ],
    })
    export class ExternalModule {}
    ```
  * Use Voucher Service Function as you need.

### **Integrate gRPC service with gateway (dashboard)**

* Read Readme.file for integrate your gRPC Service with gateway service. [Link Gateway Service Repo](https://bitbucket.org/aplikasisuper/principle-service-gateway/src/master/)

### **Pipeline Guidelines**

* Read this page for detail SRE Pipeline Guidelines [Pipeline Guidelines Page](https://bitbucket.org/aplikasisuper/engineering-standards/src/master/standards/sre/pipeline-guidelines/)

### **Done.**
