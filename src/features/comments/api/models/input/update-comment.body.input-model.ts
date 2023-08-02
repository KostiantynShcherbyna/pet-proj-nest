import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH } from "src/infrastructure/utils/constants";

export class UpdateCommentBodyInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @Length(COMMENT_CONTENT_MIN_LENGTH, COMMENT_CONTENT_MAX_LENGTH)
  content: string;
}
