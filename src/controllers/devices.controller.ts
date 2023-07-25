import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSession } from "src/decorators/device-session.decorator"
import { RefreshGuard } from "src/guards/refresh.guard"
import { DeviceSessionInputModel } from "src/input-models/request/device-session.input-model"
import { AuthQueryRepository } from "src/repositories/query/auth.query.repository"
import { DevicesService } from "src/services/devices.service"
import { DeleteOtherDevicesCommand } from "src/use-cases/devices/delete-other-devices.use-case"
import { DeleteSpecialDeviceCommand } from "src/use-cases/devices/delete-special-device.use-case"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { DeviceIdInputModel } from "../input-models/uri/deviceId.input-model"

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
    @DeviceSession() deviceSession: DeviceSessionInputModel,
  ) {
    return await this.authQueryRepository.findDevicesByUserIdView(deviceSession.userId)
  }

  @UseGuards(RefreshGuard)
  @Delete("devices")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
  ) {
    const result = await this.commandBus.execute(
      new DeleteOtherDevicesCommand(
        deviceSession.userId,
        deviceSession.deviceId
      )
    )
    if (result.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (result.error === ErrorEnums.DEVICES_NOT_DELETE) throw new UnauthorizedException()
    return
  }

  @UseGuards(RefreshGuard)
  @Delete("devices/:deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpecialDevice(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: DeviceIdInputModel,
  ) {
    const result = await this.commandBus.execute(
      new DeleteSpecialDeviceCommand(
        param.deviceId,
        deviceSession.userId
      )
    )
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
