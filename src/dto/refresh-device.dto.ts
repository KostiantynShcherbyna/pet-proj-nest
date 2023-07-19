import { DevicesDocument } from "src/schemas/devices.schema"

export type RefreshDeviceDto = {
    deviceIp: string
    userAgent: string
    device: DevicesDocument,
    accessJwtSecret: string,
    refreshJwtSecret: string,
}