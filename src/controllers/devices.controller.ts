import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  NotFoundException,
  HttpCode,
  Inject,
  Req,
  UseGuards, HttpStatus
} from "@nestjs/common"
import { DevicesService } from "src/services/devices.service"
import { AuthQueryRepository } from "src/repositories/query/auth.query.repository"
import { RefreshGuard } from "src/guards/refresh.guard"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { ObjectIdDeviceIdModel } from "../models/uri/ObjectId-deviceId.model"

@Controller("devices")
export class DevicesController {
  constructor(
    @Inject(DevicesService) protected devicesService: DevicesService,
    @Inject(AuthQueryRepository) protected authQueryRepository: AuthQueryRepository
  ) {
  }

  @UseGuards(RefreshGuard)
  @Get()
  async getDevices(
    @Req() deviceSession: DeviceSessionModel
  ) {
    return await this.authQueryRepository.findDevicesByUserIdView(deviceSession.userId)
  }

  @UseGuards(RefreshGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(
    @Req() deviceSession: DeviceSessionModel
  ) {
    return await this.devicesService.deleteOtherDevices(deviceSession.userId, deviceSession.deviceId)
  }

  @UseGuards(RefreshGuard)
  @Delete(":deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpecialDevice(
    @Req() deviceSession: DeviceSessionModel,
    @Param("deviceId") deviceId: ObjectIdDeviceIdModel,
  ) {
    const result = await this.devicesService.deleteSpecialDevice(deviceId.deviceId, deviceSession.userId)
    if (result.error !== null) throw new NotFoundException()
    return
  }
}
