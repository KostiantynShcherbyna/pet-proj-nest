import { Devices, DevicesDocument, DevicesModel } from "src/schemas/devices.schema"

export type RefreshTokens = {
    accessToken: string
    refreshToken: string
}