import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class UpdateCommentParamInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  commentId: string
}
