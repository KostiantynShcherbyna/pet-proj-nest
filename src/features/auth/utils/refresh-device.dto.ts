import { DevicesDocument } from "src/features/entities/mongoose/devices.schema"

export type RefreshDeviceDto = {
    deviceIp: string
    userAgent: string
    device: DevicesDocument,
    accessJwtSecret: string,
    refreshJwtSecret: string,
}