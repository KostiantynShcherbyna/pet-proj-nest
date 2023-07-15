import { Devices, DevicesDocument, DevicesModel } from "src/schemas/devices.schema"

export type CreateTokens = {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}