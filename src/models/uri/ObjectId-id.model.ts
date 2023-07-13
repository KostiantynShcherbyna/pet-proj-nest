import { IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator"
import { Type } from "class-transformer"
import { ObjectId } from "mongodb"

export class ObjectIdIdModel {
  @IsString()
  @MaxLength(100)
  @IsMongoId()
  id: string
}
