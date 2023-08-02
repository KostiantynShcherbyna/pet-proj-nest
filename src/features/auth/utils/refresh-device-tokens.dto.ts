import { Devices, DevicesDocument, DevicesModel } from "src/features/auth/application/entitys/devices.schema"

export type RefreshDeviceTokensDto = {
    accessToken: string
    refreshToken: string
}