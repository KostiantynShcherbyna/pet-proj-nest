import { DevicesModel } from "src/features/entities/mongoose/devices.schema"

export interface CreateDeviceDto {
  deviceIp: string
  userAgent: string
  userId: string
  accessJwtSecret: string
  refreshJwtSecret: string
  DevicesModel: DevicesModel
}