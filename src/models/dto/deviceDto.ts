import { bodyAuthModel } from "../body/bodyAuthModel"

export type deviceDto = {
    ip: string
    title: string
    lastActiveDate: string
    deviceId: string

    userId: string
    expireAt: Date
}