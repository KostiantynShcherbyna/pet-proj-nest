import { DevicesDocument, } from "src/features/auth/application/entitys/devices.schema"

export interface CreateDeviceTokensDto {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}