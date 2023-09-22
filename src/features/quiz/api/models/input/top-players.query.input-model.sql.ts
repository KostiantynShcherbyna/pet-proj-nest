import { Type } from "class-transformer"
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, Validate } from "class-validator"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT_QUIZ_TOP } from "src/infrastructure/utils/constants"

function IsStringOrStringArray(value: any): boolean {
  if (typeof value === 'string') return true
  return !!(Array.isArray(value) && value.every(item => typeof item === 'string'))
}


export class TopPlayersQueryInputModelSql {
  @IsOptional()
  @Validate(IsStringOrStringArray)
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
