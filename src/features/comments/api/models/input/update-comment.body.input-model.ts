import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH } from "../../../../../infrastructure/utils/constants"
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"

export class UpdateCommentBodyInputModel {
  @Transform(({ value }) => trimValue(value, "content"))
  @IsString()
  @Length(COMMENT_CONTENT_MIN_LENGTH, COMMENT_CONTENT_MAX_LENGTH)
  content: string;
}
