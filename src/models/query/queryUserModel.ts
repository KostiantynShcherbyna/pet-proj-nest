import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator"

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

  @IsInt()
  @IsNotEmpty()
  pageNumber: number;

  @IsInt()
  @IsNotEmpty()
  pageSize: number;
}
