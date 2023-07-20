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
  UseGuards, HttpStatus, ForbiddenException, UnauthorizedException
} from "@nestjs/common"
import { DevicesService } from "src/services/devices.service"
import { AuthQueryRepository } from "src/repositories/query/auth.query.repository"
import { RefreshGuard } from "src/guards/refresh.guard"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { ObjectIdDeviceIdModel } from "../models/uri/deviceId.model"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { DeviceSessionParamDecorator } from "src/decorators/device-session.param.decorator"

@Controller("security")
export class DevicesController {
  constructor(
    @Inject(DevicesService) protected devicesService: DevicesService,
    @Inject(AuthQueryRepository) protected authQueryRepository: AuthQueryRepository
  ) {
  }

  @UseGuards(RefreshGuard)
  @Get("devices")
  async getDevices(
    @DeviceSessionParamDecorator() deviceSession: DeviceSessionModel,
  ) {
    return await this.authQueryRepository.findDevicesByUserIdView(deviceSession.userId)
  }

  @UseGuards(RefreshGuard)
  @Delete("devices")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(
    @DeviceSessionParamDecorator() deviceSession: DeviceSessionModel,
  ) {
    const result = await this.devicesService.deleteOtherDevices(deviceSession.userId, deviceSession.deviceId)
    if (result.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (result.error === ErrorEnums.DEVICES_NOT_DELETE) throw new UnauthorizedException()
    return
  }

  @UseGuards(RefreshGuard)
  @Delete("devices/:deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpecialDevice(
    @DeviceSessionParamDecorator() deviceSession: DeviceSessionModel,
    @Param() params: ObjectIdDeviceIdModel,
  ) {
    const result = await this.devicesService.deleteSpecialDevice(params.deviceId, deviceSession.userId)
    if (result.error === ErrorEnums.DEVICE_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.DEVICE_NOT_FOUND, "deviceId")
    )
    if (result.error === ErrorEnums.FOREIGN_DEVICE_NOT_DELETE) throw new ForbiddenException()
    if (result.error === ErrorEnums.DEVICE_NOT_DELETE) throw new NotFoundException(
      callErrorMessage(ErrorEnums.DEVICE_NOT_DELETE, "deviceId")
    )
    return
  }
}
