import { IsNumber, IsString } from 'class-validator';

export class QueryUserModel {
  @IsString()
  searchLoginTerm: string;
  @IsString()
  searchEmailTerm: string;
  @IsString()
  sortBy: string;
  @IsString()
  sortDirection: string;
  @IsNumber()
  pageNumber: number;
  @IsNumber()
  pageSize: number;
}
