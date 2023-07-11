import { BodyAuthModel } from "../body/BodyAuthModel"
import { IsDate, IsNotEmpty, IsString } from "class-validator"
import { Optional } from "@nestjs/common"

export class OptionalDeviceSessionModel {
  @Optional()
  @IsString()
  @IsNotEmpty()
  ip: string

  @Optional()
  @IsString()
  @IsNotEmpty()
  title: string

  @Optional()
  @IsString()
  @IsNotEmpty()
  lastActiveDate: string

  @Optional()
  @IsString()
  @IsNotEmpty()
  deviceId: string

  @Optional()
  @IsString()
  @IsNotEmpty()
  userId: string

  @Optional()
  @IsDate()
  @IsNotEmpty()
  expireAt: Date
}