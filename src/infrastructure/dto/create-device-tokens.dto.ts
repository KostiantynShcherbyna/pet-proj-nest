import { DevicesDocument, } from "src/features/auth/application/entity/devices.schema"

export type CreateDeviceTokensDto = {
    accessToken: string
    refreshToken: string
    refreshEntry: DevicesDocument
}