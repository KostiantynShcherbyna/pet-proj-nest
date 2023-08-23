import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class GetCommentsParamInputModelSql {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  postId: string
}
