import { Devices, DevicesDocument } from "src/schemas/devices.schema"

export type ReturnTokensDto = {
    accessToken: string
    refreshToken: string
    refreshPayload?: DevicesDocument
}