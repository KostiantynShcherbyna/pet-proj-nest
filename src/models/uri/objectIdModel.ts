import { IsMongoId, IsNotEmpty, IsString } from "class-validator"
import { Type } from "class-transformer"
import { Types } from "mongoose"

export class ObjectIdModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
