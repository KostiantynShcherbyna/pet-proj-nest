import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from "class-validator"
import { DefaultValuePipe } from "@nestjs/common"
import { SortDirection } from "../../utils/constants/constants"
import { Type } from "class-transformer"

export class QueryBlogModel {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchNameTerm: string = ""

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy: string = "createdAt"

  @IsOptional()
  @IsEnum(SortDirection)
  @MaxLength(100)
  sortDirection: SortDirection = SortDirection.desc

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageNumber: number = 1

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize: number = 10
}
