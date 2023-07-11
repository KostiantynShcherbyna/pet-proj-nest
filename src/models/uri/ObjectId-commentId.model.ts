import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class ObjectIdCommentIdModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  commentId: string
}
