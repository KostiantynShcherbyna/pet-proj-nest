import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH } from "src/utils/constants/constants";

export class BodyCommentInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @Length(COMMENT_CONTENT_MIN_LENGTH, COMMENT_CONTENT_MAX_LENGTH)
  content: string;
}
