import { IsNotEmpty, IsString, Length, Matches, MaxLength, NotContains } from "class-validator"
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX
} from "../../utils/constants/constants"
import { Transform, TransformFnParams } from "class-transformer"

export class BodyBlogModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(BLOGS_NAME_MAX_LENGTH)
  name: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(BLOGS_DESCRIPTION_MAX_LENGTH)
  description: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(BLOGS_WEBSITEURL_MAX_LENGTH)
  @Matches(BLOGS_WEBSITEURL_REGEX)
  websiteUrl: string
}
