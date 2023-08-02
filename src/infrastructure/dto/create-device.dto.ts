import { DevicesModel } from "src/features/auth/application/entity/devices.schema"

export interface CreateDeviceDto {
  deviceIp: string
  userAgent: string
  userId: string
  accessJwtSecret: string
  refreshJwtSecret: string
  DevicesModel: DevicesModel
}