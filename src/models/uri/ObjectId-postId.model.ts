import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class ObjectIdPostIdModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId: string
}
