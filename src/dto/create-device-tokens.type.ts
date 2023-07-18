import { Devices, DevicesDocument, DevicesModel } from "src/schemas/devices.schema"

export type CreateDeviceTokens = {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}