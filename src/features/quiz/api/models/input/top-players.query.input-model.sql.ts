import { Type } from "class-transformer"
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min } from "class-validator"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT_QUIZ_TOP } from "src/infrastructure/utils/constants"

export class TopPlayersQueryInputModelSql {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  sort: string[] = SORT_BY_DEFAULT_QUIZ_TOP

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
