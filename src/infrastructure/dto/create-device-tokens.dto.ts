import { DevicesDocument, } from "src/infrastructure/schemas/devices.schema"

export type CreateDeviceTokensDto = {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}