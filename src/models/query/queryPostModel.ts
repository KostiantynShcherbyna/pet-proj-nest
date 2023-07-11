import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator"

export class QueryPostModel {
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  pageNumber: number

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  pageSize: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sortBy: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sortDirection: string
}
