import { IsNumber, IsString } from 'class-validator';

export class QueryCommentModel {
  @IsString()
  sortBy: string;

  @IsString()
  sortDirection: string;

  @IsNumber()
  pageNumber: number;
  
  @IsNumber()
  pageSize: number;
}
