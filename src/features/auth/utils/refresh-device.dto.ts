import { DevicesDocument } from "src/features/auth/application/entitys/devices.schema"

export type RefreshDeviceDto = {
    deviceIp: string
    userAgent: string
    device: DevicesDocument,
    accessJwtSecret: string,
    refreshJwtSecret: string,
}