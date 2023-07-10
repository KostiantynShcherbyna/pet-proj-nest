import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class QueryPostModel {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}
