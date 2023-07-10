import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class QueryUserModel {
  @IsString()
  @IsNotEmpty()
  searchLoginTerm: string;

  @IsString()
  @IsNotEmpty()
  searchEmailTerm: string;

  @IsString()
  @IsNotEmpty()
  sortBy: string;

  @IsString()
  @IsNotEmpty()
  sortDirection: string;

  @IsNumber()
  @IsNotEmpty()
  pageNumber: number;

  @IsNumber()
  @IsNotEmpty()
  pageSize: number;
}
