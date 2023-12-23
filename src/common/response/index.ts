import { OKMessage } from '../consts/ok.code';

export class Response<T> {
  private message: string | string[];
  private result: T;
  private pagination?: Pagination;

  constructor(result: T, message?: string | string[]) {
    this.message = OKMessage.Success;
    this.result = result;

    if (message) {
      this.message = message;
    }
  }

  public setPagination(pagination: Pagination) {
    this.pagination = pagination;
  }

  public toJSON() {
    return {
      message: this.message,
      result: this.result,
      pagination: this.pagination,
    };
  }
}

export class List<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class Pagination {
  page: number;
  page_size: number;
  total_page: number;
  total_records: number;

  constructor() {
    this.page = 0;
    this.page_size = 0;
    this.total_page = 0;
    this.total_records = 0;
  }
}
