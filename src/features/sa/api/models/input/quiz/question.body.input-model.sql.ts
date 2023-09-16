import { IsArray, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from "class-validator"
import { Transform, Type } from "class-transformer"
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  POSTS_CONTENT_MAX_LENGTH,
  POSTS_SHORTDESCRIPTION_MAX_LENGTH,
  POSTS_TITLE_MAX_LENGTH,
  PublishedStatus, QUESTION_MAX_LENGTH, QUESTION_MIN_LENGTH,
  SORT_BY_DEFAULT_SQL,
  SortDirectionOrm
} from "../../../../../../infrastructure/utils/constants"
import { trimValue } from "../../../../../../infrastructure/decorators/trim.decorator"


export class QuestionBodyInputModelSql {
  @Transform(({ value }) => trimValue(value, "body"))
  @IsNotEmpty()
  @IsString()
  @Length(QUESTION_MIN_LENGTH, QUESTION_MAX_LENGTH)
  body: string

  @IsNotEmpty()
  @IsArray()
  correctAnswers: string[]
}
