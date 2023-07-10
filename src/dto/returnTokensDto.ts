import { Devices, DevicesDocument } from "src/schemas/devices.schema"

export type returnTokensDto = {
    accessToken: string
    refreshToken: string
    refreshPayload?: DevicesDocument
}