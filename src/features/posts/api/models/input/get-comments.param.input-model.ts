import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class GetCommentsParamInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId: string
}
