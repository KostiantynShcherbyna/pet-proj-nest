import { Transform, TransformFnParams } from "class-transformer"
import { IsMongoId, IsNotEmpty, IsString, MaxLength, Validate } from "class-validator"
import {
  POSTS_CONTENT_MAX_LENGTH,
  POSTS_SHORTDESCRIPTION_MAX_LENGTH,
  POSTS_TITLE_MAX_LENGTH
} from "../../../../../infrastructure/utils/constants"
import { BlogIdIsExist } from "../../../../../infrastructure/decorators/blogId.decorator"
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"


export class UpdatePostBodyInputModel {
  @Transform(({ value }) => trimValue(value, "title"))
  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTS_TITLE_MAX_LENGTH)
  title: string

  @Transform(({ value }) => trimValue(value, "shortDescription"))
  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTS_SHORTDESCRIPTION_MAX_LENGTH)
  shortDescription: string

  @Transform(({ value }) => trimValue(value, "content"))
  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTS_CONTENT_MAX_LENGTH)
  content: string

  @Transform(({ value }) => trimValue(value, "blogId"))
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @Validate(BlogIdIsExist)
  blogId: string
}
