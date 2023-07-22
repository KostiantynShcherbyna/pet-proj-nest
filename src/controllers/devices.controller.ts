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
import { DeviceSessionDecorator } from "src/decorators/device-session.decorator"
import { DeleteOtherDevicesCommand } from "src/services/use-cases/devices/delete-other-devices.use-case"
import { DeleteSpecialDeviceCommand } from "src/services/use-cases/devices/delete-special-device.use-case"
import { CommandBus } from "@nestjs/cqrs"

@Controller("security")
export class DevicesController {
  constructor(
    private commandBus: CommandBus,
    protected devicesService: DevicesService,
    protected authQueryRepository: AuthQueryRepository,
  ) {
  }

  @UseGuards(RefreshGuard)
  @Get("devices")
  async getDevices(
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel,
  ) {
    return await this.authQueryRepository.findDevicesByUserIdView(deviceSession.userId)
  }

  @UseGuards(RefreshGuard)
  @Delete("devices")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel,
  ) {
    const result = await this.commandBus.execute(new DeleteOtherDevicesCommand(deviceSession.userId, deviceSession.deviceId))
    if (result.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (result.error === ErrorEnums.DEVICES_NOT_DELETE) throw new UnauthorizedException()
    return
  }

  @UseGuards(RefreshGuard)
  @Delete("devices/:deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpecialDevice(
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel,
    @Param() param: ObjectIdDeviceIdModel,
  ) {
    const result = await this.commandBus.execute(new DeleteSpecialDeviceCommand(param.deviceId, deviceSession.userId))
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
