import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator"
import { Type } from "class-transformer"
import { SORT_BY_DEFAULT, SortDirection } from "../../utils/constants/constants"

export class QueryPostModel {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10

  @IsOptional()
  @IsString()
  sortBy: string = SORT_BY_DEFAULT

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.desc
}
