import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class ObjectIdPostIdInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId: string
}
