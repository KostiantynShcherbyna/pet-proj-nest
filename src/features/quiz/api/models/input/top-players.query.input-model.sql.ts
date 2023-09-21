import { Type } from "class-transformer"
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min } from "class-validator"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT_QUIZ_TOP } from "src/infrastructure/utils/constants"

export class TopPlayersQueryInputModelSql {
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  sort: string | string[] = SORT_BY_DEFAULT_QUIZ_TOP

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
