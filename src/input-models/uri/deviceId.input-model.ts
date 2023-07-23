import { IsString, IsUUID } from "class-validator"

export class DeviceIdInputModel {
  @IsString()
  @IsUUID()
  deviceId: string
}
