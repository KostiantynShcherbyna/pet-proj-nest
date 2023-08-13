import { Devices, DevicesDocument, DevicesModel } from "src/features/entities/mongoose/devices.schema"

export type RefreshDeviceTokensDto = {
    accessToken: string
    refreshToken: string
}