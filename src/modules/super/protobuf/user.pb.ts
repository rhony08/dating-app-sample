/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "user";

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
  warehouse_id: number;
}

export interface CreateUserResponse {
  message: string;
  result: number;
}

export interface UpdateUserRequest {
  id: number;
  role_id: number;
  is_partner: number;
  name: string;
  username: string;
  email: string;
  password: string;
  status: number;
  warehouse_id: number;
}

export interface UpdateUserResponse {
  message: string;
  result: UserUpdated | undefined;
}

export interface UserUpdated {
  id: number;
  role_id: number;
  name: string;
  username: string;
  email: string;
  warehouse_id: number;
}

export const USER_PACKAGE_NAME = "user";

export interface UserServiceClient {
  createUser(request: CreateUserRequest): Observable<CreateUserResponse>;

  updateUser(request: UpdateUserRequest): Observable<UpdateUserResponse>;
}

export interface UserServiceController {
  createUser(
    request: CreateUserRequest,
  ): Promise<CreateUserResponse> | Observable<CreateUserResponse> | CreateUserResponse;

  updateUser(
    request: UpdateUserRequest,
  ): Promise<UpdateUserResponse> | Observable<UpdateUserResponse> | UpdateUserResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createUser", "updateUser"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_SERVICE_NAME = "UserService";
