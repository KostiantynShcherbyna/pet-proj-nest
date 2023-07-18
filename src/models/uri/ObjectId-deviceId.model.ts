import { IsMongoId, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class ObjectIdDeviceIdModel {
  @IsString()
  // @IsMongoId()
  // @IsUUID()
  deviceId: string
}
