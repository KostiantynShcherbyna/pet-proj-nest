import { IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class ObjectIdIdInputModel {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
