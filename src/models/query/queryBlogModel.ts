import { IsNumber, IsString } from 'class-validator';

export class QueryBlogModel {
  @IsString()
  searchNameTerm: string;
  @IsString()
  sortBy: string;
  @IsString()
  sortDirection: string;
  @IsNumber()
  pageNumber: number;
  @IsNumber()
  pageSize: number;
}
