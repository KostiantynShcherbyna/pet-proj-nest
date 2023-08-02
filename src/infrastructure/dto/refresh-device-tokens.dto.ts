import { Devices, DevicesDocument, DevicesModel } from "src/infrastructure/schemas/devices.schema"

export type RefreshDeviceTokensDto = {
    accessToken: string
    refreshToken: string
}