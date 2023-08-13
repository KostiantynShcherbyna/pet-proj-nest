import { DevicesDocument, } from "src/features/entities/mongoose/devices.schema"

export interface CreateDeviceTokensDto {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}