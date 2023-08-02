import { Devices, DevicesDocument, DevicesModel } from "src/features/auth/application/entity/devices.schema"

export type RefreshDeviceTokensDto = {
    accessToken: string
    refreshToken: string
}