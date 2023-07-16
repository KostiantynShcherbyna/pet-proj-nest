import { Transform, TransformFnParams } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH } from "src/utils/constants/constants";
import { callErrorMessage } from "src/utils/errors/callErrorMessage";
import { ErrorEnums } from "src/utils/errors/errorEnums";
import { BlogIdIsExist, BlogIdIsExistConstraint } from "src/validators/blogId.validator";

export class BodyPostModel {
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
  // @Validate(BlogIdExistValidatorConstraint)
  @BlogIdIsExist()
  blogId: string;
}
