import { JwtService } from "@nestjs/jwt"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { randomUUID } from "crypto"
import { addMinutes } from "date-fns"
import { HydratedDocument, Model, Types } from "mongoose"
import { ReturnTokensDto } from "src/dto/ReturnTokensDto"
import { EXPIRE_AT_ACCESS, EXPIRE_AT_REFRESH } from "src/utils/constants/constants"


@Schema()
export class Devices {

  _id: Types.ObjectId

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
  expireAt: Date

  static async createDevice({ deviceIp, userAgent, userId }, jwtService: JwtService) {

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
      _id: new Types.ObjectId(),
      ip: deviceIp,
      title: userAgent,
      deviceId: accessPayload.deviceId,
      userId: userId,

      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addMinutes(newIssueAt, EXPIRE_AT_REFRESH)
    }

    const accessToken = await jwtService.signAsync(accessPayload)
    const refreshToken = await jwtService.signAsync(refreshPayload)

    return {
      accessToken,
      refreshToken,
      refreshPayload,
    }

  }


  static async deleteDevice(deviceId: string, DevicesModel: DevicesModel): Promise<number> {

    const deletedResult = await DevicesModel.deleteOne({ deviceId: deviceId })
    return deletedResult.deletedCount
  }


  static async deleteOtherDevices(userId: string, deviceId: string, DevicesModel: DevicesModel): Promise<number> {

    const deletedResult = await DevicesModel.deleteMany(
      { $and: [{ userId: userId }, { deviceId: { $ne: deviceId } }] }
    )
    return deletedResult.deletedCount
  }


  async refreshDevice({ deviceIp, userAgent, userId }, jwtService: JwtService): Promise<ReturnTokensDto> {

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

    const accessToken = await jwtService.signAsync(accessPayload)
    const refreshToken = await jwtService.signAsync(refreshPayload)

    this.lastActiveDate = refreshPayload.lastActiveDate
    this.expireAt = refreshPayload.expireAt

    return {
      accessToken,
      refreshToken,
    }

  }


  checkOwner(userId: string) {
    return this.userId === userId
  }

}

interface DevicesStatics {
  createDevice({ deviceIp, userAgent, userId }, jwtService: JwtService): Promise<ReturnTokensDto>

  deleteDevice(deviceId: string, DevicesModel: DevicesModel): Promise<number>

  deleteOtherDevices(userId: string, deviceId: string, DevicesModel: DevicesModel): Promise<number>
}

export const DevicesSchema = SchemaFactory.createForClass(Devices)

DevicesSchema.statics.createDevice = Devices.createDevice
DevicesSchema.statics.deleteDevice = Devices.deleteDevice
DevicesSchema.statics.deleteOtherDevices = Devices.deleteOtherDevices

DevicesSchema.methods.refreshDevice = Devices.prototype.refreshDevice
DevicesSchema.methods.checkOwner = Devices.prototype.checkOwner

export type DevicesDocument = HydratedDocument<Devices>
export type DevicesModel = Model<DevicesDocument> & DevicesStatics