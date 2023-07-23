import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class CommentIdInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  commentId: string
}
