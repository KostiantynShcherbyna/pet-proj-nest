import { IsMongoId, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class UpdateCommentParamInputModelSql {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  commentId: string
}
