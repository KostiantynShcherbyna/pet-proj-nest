import { Transform, TransformFnParams } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH } from "src/utils/constants/constants";
import { callErrorMessage } from "src/utils/managers/error-message.manager";
import { ErrorEnums } from "src/utils/errors/error-enums";
import {  BlogIdIsExist } from "src/validators/blogId.validator";

export class BodyPostInputModel {
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
