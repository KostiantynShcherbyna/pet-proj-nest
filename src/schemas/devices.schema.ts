import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { HydratedDocument, Model } from 'mongoose';
import { Contract } from 'src/contracts/Contract';
import { returnTokensDto } from 'src/models/dto/returnTokensDto';
import { settings } from 'src/settings';
import { EXPIRES_TIME_ACCESS, EXPIRES_TIME_REFRESH, EXPIRE_AT_ACCESS, EXPIRE_AT_REFRESH } from 'src/utils/constants/constants';
import { errorEnums } from 'src/utils/errors/errorEnums';
import { errorMessages } from 'src/utils/errors/errorMessages';
import { compareHash } from 'src/utils/hashFunctions/compareHash';
import { tokensView } from 'src/views/tokensView';



@Schema()
export class Devices {
    @Prop({
        type: String,
        required: true,
    })
    ip: string

    @Prop({
        type: String,
        required: true,
    })
    title: string

    @Prop({
        type: String,
        required: true,
    })
    lastActiveDate: string

    @Prop({
        type: String,
        required: true,
    })
    deviceId: string

    @Prop({
        type: String,
        required: true,
    })
    userId: string

    @Prop({
        type: Date,
        required: true,
    })
    expireAt: string

    static async createDevice({ deviceIp, userAgent, loginBody, usersRepositoryMngs }) {

        const user = await usersRepositoryMngs.findUserLoginOrEmail({ login: loginBody.loginOrEmail, email: loginBody.loginOrEmail })
        if (user === null) return new Contract(null, errorEnums.NOT_FOUND_USER)
        if (user.emailConfirmation.isConfirmed === false) return new Contract(null, errorEnums.USER_EMAIL_NOT_CONFIRMED)

        const isPassword = await compareHash(user.accountData.passwordHash, loginBody.password)
        if (isPassword === false) return new Contract(null, errorEnums.PASSWORD_NOT_COMPARED)

        const newIssueAt = new Date(Date.now())

        const accessPayload = {
            ip: deviceIp,
            title: userAgent,
            deviceId: randomUUID(),
            userId: user._id.toString(),

            lastActiveDate: newIssueAt.toISOString(),
            expireAt: addMinutes(newIssueAt, EXPIRE_AT_ACCESS)
        }
        const refreshPayload = {
            ip: deviceIp,
            title: userAgent,
            deviceId: accessPayload.deviceId,
            userId: user._id.toString(),

            lastActiveDate: newIssueAt.toISOString(),
            expireAt: addMinutes(newIssueAt, EXPIRE_AT_REFRESH)
        }

        // const jwtServiceMngs = new JwtServiceMngs()
        // const accessToken = jwtServiceMngs.createToken(accessPayload, settings.ACCESS_JWT_SECRET, EXPIRES_TIME_ACCESS)
        // const refreshToken = jwtServiceMngs.createToken(refreshPayload, settings.REFRESH_JWT_SECRET, EXPIRES_TIME_REFRESH)

        // await this.create(refreshPayload)

        // return {
        //     accessToken,
        //     refreshToken,
        // }

    }

    // static async deleteDevice(deviceId: string): Promise<number> {

    //     const deletedResult = await this.deleteOne({ deviceId: deviceId })
    //     return deletedResult.deletedCount
    // }

    refreshDevice({ deviceIp, userAgent, userId }) {

        const newIssueAt = new Date(Date.now())

        const accessPayload = {
            ip: deviceIp,
            title: userAgent,
            deviceId: randomUUID(),
            userId: userId,

            lastActiveDate: newIssueAt.toISOString(),
            expireAt: addMinutes(newIssueAt, EXPIRE_AT_ACCESS)
        }
        const refreshPayload = {
            ip: deviceIp,
            title: userAgent,
            deviceId: accessPayload.deviceId,
            userId: userId,

            lastActiveDate: newIssueAt.toISOString(),
            expireAt: addMinutes(newIssueAt, EXPIRE_AT_REFRESH)
        }

        // const jwtServiceMngs = new JwtServiceMngs()
        // const accessToken = jwtServiceMngs.createToken(accessPayload, settings.ACCESS_JWT_SECRET, EXPIRES_TIME_ACCESS)
        // const refreshToken = jwtServiceMngs.createToken(refreshPayload, settings.REFRESH_JWT_SECRET, EXPIRES_TIME_REFRESH)

        // this.lastActiveDate = refreshPayload.lastActiveDate
        // this.expireAt = refreshPayload.expireAt

        // return {
        //     accessToken,
        //     refreshToken,
        // }

    }


}
interface DevicesStatics {
    createDevice({ deviceIp, userAgent, loginBody, usersRepositoryMngs }): Promise<returnTokensDto>
}

export const DevicesSchema = SchemaFactory.createForClass(Devices)

DevicesSchema.statics.createDevice = Devices.createDevice
DevicesSchema.methods.refreshDevice = Devices.prototype.refreshDevice

export type DevicesDocument = HydratedDocument<Devices>
export type DevicesModel = Model<DevicesDocument> & DevicesStatics