import { IsString } from "class-validator"

export class ObjectIdDeviceIdInputModel {
  @IsString()
  // @IsMongoId()
  // @IsUUID()
  deviceId: string
}
