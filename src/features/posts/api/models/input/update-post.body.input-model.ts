import { Transform, TransformFnParams } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH } from "src/infrastructure/utils/constants";
import { callErrorMessage } from "src/infrastructure/adapters/exception-message.adapter";
import { ErrorEnums } from "src/infrastructure/utils/error-enums";
import {  BlogIdIsExist } from "src/infrastructure/decorators/blogId.decorator";

export class UpdatePostBodyInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(POSTS_TITLE_MAX_LENGTH)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(POSTS_SHORTDESCRIPTION_MAX_LENGTH)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(POSTS_CONTENT_MAX_LENGTH)
  content: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoId()
  @Validate(BlogIdIsExist)
  blogId: string;
}
