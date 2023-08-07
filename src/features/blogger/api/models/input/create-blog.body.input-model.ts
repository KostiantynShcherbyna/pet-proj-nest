import { IsNotEmpty, IsString, Length, Matches, MaxLength, NotContains } from "class-validator"
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX
} from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer"
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"

export class CreateBlogBodyInputModel {
  @Transform(({ value }) => trimValue(value, "name"))
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_NAME_MAX_LENGTH)
  name: string

  @Transform(({ value }) => trimValue(value, "description"))
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_DESCRIPTION_MAX_LENGTH)
  description: string

  @Transform(({ value }) => trimValue(value, "websiteUrl"))
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_WEBSITEURL_MAX_LENGTH)
  @Matches(BLOGS_WEBSITEURL_REGEX)
  websiteUrl: string
}
