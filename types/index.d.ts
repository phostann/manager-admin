export interface IResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface IPageData<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

export interface IPageResponse<T> {
  code: number;
  message: string;
  data: IPageData<T>;
}
