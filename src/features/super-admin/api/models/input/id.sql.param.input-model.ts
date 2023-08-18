import { IsMongoId, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator"

export class IdSqlParamInputModel {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsUUID()
  id: string
}
