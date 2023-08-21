import { IsMongoId, IsNotEmpty, IsString, IsUUID } from "class-validator"
import { Type } from "class-transformer"
import { Types } from "mongoose"

export class BlogIdParamInputModelSql {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  blogId: string
}
