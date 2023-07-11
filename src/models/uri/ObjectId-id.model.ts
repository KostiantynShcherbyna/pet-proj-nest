import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class ObjectIdIdModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
