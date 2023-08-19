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
import { DeleteSpecialDeviceParamInputModel } from "./models/input/delete-special-device.param.input-model"
import { DeviceSessionReqInputModel } from "./models/input/device-session.req.input-model"
import { AuthQueryRepository } from "../../auth/repository/mongoose/auth.query.repository"
import { RefreshGuard } from "../../../infrastructure/guards/refresh.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeleteOtherDevicesCommand } from "../application/use-cases/mongoose/delete-other-devices.use-case"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { DeleteSpecialDeviceCommand } from "../application/use-cases/mongoose/delete-special-device.use-case"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { DevicesSqlQueryRepository } from "../repository/sql/devices.sql.query.repository"
import { DeleteOtherDevicesSqlCommand } from "../application/use-cases/sql/delete-other-devices.sql.use-case"
import { DeleteSpecialDeviceSqlCommand } from "../application/use-cases/sql/delete-special-device.sql.use-case"

@Controller("security")
export class DevicesSqlController {
  constructor(
    private commandBus: CommandBus,
    protected devicesSqlQueryRepository: DevicesSqlQueryRepository,
  ) {
  }

  @UseGuards(RefreshGuard)
  @Get("devices")
  async getDevices(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    return await this.devicesSqlQueryRepository.findDevicesByUserId(deviceSession.userId)
  }

  @UseGuards(RefreshGuard)
  @Delete("devices")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const result = await this.commandBus.execute(
      new DeleteOtherDevicesSqlCommand(
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
      new DeleteSpecialDeviceSqlCommand(
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
