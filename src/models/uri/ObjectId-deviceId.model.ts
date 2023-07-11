import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class ObjectIdDeviceIdModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  deviceId: string
}
