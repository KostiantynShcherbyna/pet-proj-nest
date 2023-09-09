import { IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator"
import { Type } from "class-transformer"
import {
  PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, PublishedStatus,
  SORT_BY_DEFAULT_SQL, SortDirection,
  SortDirectionOrm
} from "../../../../../../infrastructure/utils/constants"


export class GetQuestionsQueryInputModel {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bodySearchTerm: string = ""

  @IsOptional()
  @IsString()
  @IsEnum(PublishedStatus)
  @MaxLength(100)
  publishedStatus: string = ""

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy: string = SORT_BY_DEFAULT_SQL

  @IsOptional()
  @IsEnum(SortDirectionOrm)
  @MaxLength(4)
  sortDirection: SortDirection = SortDirection.Desc

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = PAGE_NUMBER_DEFAULT

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = PAGE_SIZE_DEFAULT
}
