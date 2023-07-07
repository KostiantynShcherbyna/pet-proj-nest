import { IsNumber, IsString } from 'class-validator';

export class QueryPostModel {
  @IsNumber()
  pageNumber: number;
  @IsNumber()
  pageSize: number;
  @IsString()
  sortBy: string;
  @IsString()
  sortDirection: string;
}
