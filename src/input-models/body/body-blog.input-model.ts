import { IsNotEmpty, IsString, Length, Matches, MaxLength, NotContains } from "class-validator"
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX
} from "../../utils/constants/constants"
import { Transform, TransformFnParams } from "class-transformer"

export class BodyBlogInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_NAME_MAX_LENGTH)
  name: string

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_DESCRIPTION_MAX_LENGTH)
  description: string

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_WEBSITEURL_MAX_LENGTH)
  @Matches(BLOGS_WEBSITEURL_REGEX)
  websiteUrl: string
}
