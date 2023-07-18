import { DevicesDocument, } from "src/schemas/devices.schema"

export type CreateDeviceTokensDto = {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}