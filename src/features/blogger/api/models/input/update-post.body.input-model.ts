import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsString, Length, MaxLength } from "class-validator"
import {
  POSTS_CONTENT_MAX_LENGTH,
  POSTS_SHORTDESCRIPTION_MAX_LENGTH,
  POSTS_TITLE_MAX_LENGTH
} from "../../../../../infrastructure/utils/constants"

export class UpdatePostBodyInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(POSTS_TITLE_MAX_LENGTH)
  title: string

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(POSTS_SHORTDESCRIPTION_MAX_LENGTH)
  shortDescription: string

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(POSTS_CONTENT_MAX_LENGTH)
  content: string
}
