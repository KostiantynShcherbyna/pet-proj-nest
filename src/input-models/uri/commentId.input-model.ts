import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class ObjectIdCommentIdInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  commentId: string
}
