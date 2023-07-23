import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class PostIdInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId: string
}
