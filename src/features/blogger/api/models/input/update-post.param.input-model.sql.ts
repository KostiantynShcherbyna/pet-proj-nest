import { IsMongoId, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator"

export class UpdatePostParamInputModelSql {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsUUID()
  blogId: string

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  postId: string
}
