import { JwtService } from "@nestjs/jwt"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { randomUUID } from "crypto"
import { addMinutes, addSeconds } from "date-fns"
import { HydratedDocument, Model, Types } from "mongoose"
import { CreateDeviceDto } from "src/dto/create-device.dto"
import { CreateDeviceTokensDto } from "src/dto/create-device-tokens.dto"
import { RefreshDeviceTokensDto } from "src/dto/refresh-device-tokens.dto"
import { ACCESS_EXPIRES_TIME, EXPIRE_AT_ACCESS, EXPIRE_AT_REFRESH, REFRESH_EXPIRES_TIME } from "src/utils/constants/constants"
import { RefreshDeviceDto } from "src/dto/refresh-device.dto"


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
  expireAt: Date

  static async createDevice(
    { deviceIp, userAgent, userId, accessJwtSecret, refreshJwtSecret }: CreateDeviceDto,
    DevicesModel: DevicesModel
  ): Promise<CreateDeviceTokensDto> {

    const newIssueAt = new Date(Date.now())

    const accessPayload = {
      ip: deviceIp,
      title: userAgent,
      deviceId: randomUUID(),
      userId: userId,

      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_ACCESS)
    }
    const refreshPayload = {
      ip: deviceIp,
      title: userAgent,
      deviceId: accessPayload.deviceId,
      userId: userId,

      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_REFRESH)
    }

    const jwtService = new JwtService()
    const accessToken = await jwtService
      .signAsync(
        accessPayload,
        {
          secret: accessJwtSecret,
          expiresIn: ACCESS_EXPIRES_TIME
        }
      )
    const refreshToken = await jwtService
      .signAsync(
        accessPayload,
        {
          secret: refreshJwtSecret,
          expiresIn: REFRESH_EXPIRES_TIME
        }
      )


    const refreshEntry = new DevicesModel(refreshPayload)

    return {
      accessToken,
      refreshToken,
      refreshEntry,
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

  // static async deleteAllDevices(userId: string, DevicesModel: DevicesModel): Promise<number> {

  //   const deletedResult = await DevicesModel.deleteMany(
  //     { userId: userId }
  //   )
  //   return deletedResult.deletedCount
  // }


  async refreshDevice({ deviceIp, userAgent, device, accessJwtSecret, refreshJwtSecret }: RefreshDeviceDto): Promise<RefreshDeviceTokensDto> {

    const newIssueAt = new Date(Date.now())

    const accessPayload = {
      ip: deviceIp,
      title: userAgent,
      deviceId: device.deviceId,
      userId: device.userId,

      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_ACCESS)
    }
    const refreshPayload = {
      ip: deviceIp,
      title: userAgent,
      deviceId: accessPayload.deviceId,
      userId: device.userId,

      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_REFRESH)
    }


    const jwtService = new JwtService()
    const accessToken = await jwtService
      .signAsync(
        accessPayload,
        {
          secret: accessJwtSecret,
          expiresIn: ACCESS_EXPIRES_TIME
        }
      )

    const refreshToken = await jwtService
      .signAsync(
        accessPayload,
        {
          secret: refreshJwtSecret,
          expiresIn: REFRESH_EXPIRES_TIME
        }
      )

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
  createDevice(
    { deviceIp, userAgent, userId }: CreateDeviceDto,
    DevicesModel: DevicesModel
  ): Promise<CreateDeviceTokensDto>

  deleteDevice(
    deviceId: string,
    DevicesModel: DevicesModel
  ): Promise<number>

  deleteOtherDevices(
    userId: string,
    deviceId: string,
    DevicesModel: DevicesModel
  ): Promise<number>

  deleteAllDevices(
    userId: string,
    DevicesModel: DevicesModel
  ): Promise<number>
}

export const DevicesSchema = SchemaFactory.createForClass(Devices)
DevicesSchema.statics.createDevice = Devices.createDevice
DevicesSchema.statics.deleteDevice = Devices.deleteDevice
DevicesSchema.statics.deleteOtherDevices = Devices.deleteOtherDevices
// DevicesSchema.statics.deleteAllDevices = Devices.deleteAllDevices
DevicesSchema.methods.refreshDevice = Devices.prototype.refreshDevice
DevicesSchema.methods.checkOwner = Devices.prototype.checkOwner

export type DevicesDocument = HydratedDocument<Devices>
export type DevicesModel = Model<DevicesDocument> & DevicesStatics