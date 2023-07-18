import { Devices, DevicesDocument, DevicesModel } from "src/schemas/devices.schema"

export type RefreshDeviceTokensDto = {
    accessToken: string
    refreshToken: string
}