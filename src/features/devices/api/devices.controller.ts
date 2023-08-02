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
import { DeviceSession } from "src/infrastructure/decorators/device-session.decorator"
import { RefreshGuard } from "src/infrastructure/guards/refresh.guard"
import { DeviceSessionReqInputModel } from "src/features/auth/api/models/input/device-session.req.input-model"
import { AuthQueryRepository } from "src/features/auth/infrastructure/auth.query.repository"
import { DeleteOtherDevicesCommand } from "src/features/devices/application/delete-other-devices.use-case"
import { DeleteSpecialDeviceCommand } from "src/features/devices/application/delete-special-device.use-case"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { callErrorMessage } from "src/infrastructure/adapters/exception-message.adapter"
import { DeleteSpecialDeviceParamInputModel } from "./models/input/delete-special-device.param.input-model"

@Controller("security")
export class DevicesController {
  constructor(
    private commandBus: CommandBus,
    protected authQueryRepository: AuthQueryRepository,
  ) {
  }

  @UseGuards(RefreshGuard)
  @Get("devices")
  async getDevices(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    return await this.authQueryRepository.findDevicesByUserIdView(deviceSession.userId)
  }

  @UseGuards(RefreshGuard)
  @Delete("devices")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: DeleteSpecialDeviceParamInputModel,
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
    if (result.error === ErrorEnums.FOREIGN_DEVICE) throw new ForbiddenException()
    if (result.error === ErrorEnums.DEVICE_NOT_DELETE) throw new NotFoundException(
      callErrorMessage(ErrorEnums.DEVICE_NOT_DELETE, "deviceId")
    )
    return
  }
}
