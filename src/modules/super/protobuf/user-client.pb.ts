/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "userclient";

export interface FindUserByIdRequest {
  userid: number;
}

export interface User {
  id: number;
  role_id: number;
  name: string;
  username: string;
  email: string;
  warehouse_id: number;
}

export interface FindUserByIdResponse {
  message: string;
  result: User | undefined;
}

export const USERCLIENT_PACKAGE_NAME = "userclient";

export interface UserClientServiceClient {
  findUserById(request: FindUserByIdRequest): Observable<FindUserByIdResponse>;
}

export interface UserClientServiceController {
  findUserById(
    request: FindUserByIdRequest,
  ): Promise<FindUserByIdResponse> | Observable<FindUserByIdResponse> | FindUserByIdResponse;
}

export function UserClientServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["findUserById"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserClientService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserClientService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_CLIENT_SERVICE_NAME = "UserClientService";
