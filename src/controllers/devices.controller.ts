import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Param,
  NotFoundException,
  HttpCode,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryUserModel } from 'src/models/query/QueryUserModel';
import { UsersQueryRepository } from 'src/repositories/query/users.query.repository';
import { BodyUserModel } from 'src/models/body/BodyUserModel';
import { UsersService } from 'src/services/users.service';
import { DevicesService } from 'src/services/devices.service';
import { AuthQueryRepository } from 'src/repositories/query/auth.query.repository';
import { RefreshGuard } from 'src/refresh.guard';
import { deviceDto } from 'src/models/dto/deviceDto';

@Controller('devices')
export class DevicesController {
  constructor(
    @Inject(DevicesService) protected devicesService: DevicesService,
    @Inject(AuthQueryRepository) protected AuthQueryRepository: AuthQueryRepository,
  ) { }

  @UseGuards(RefreshGuard)
  @Get()
  async getDevices(
    @Req() deviceSession: deviceDto,
  ) {
    return await this.AuthQueryRepository.findDevicesByUserIdView(deviceSession.userId);
  }

  @UseGuards(RefreshGuard)
  @Post()
  @HttpCode(204)
  async deleteOtherDevices(
    @Req() deviceSession: deviceDto
  ) {
    return await this.devicesService.deleteOtherDevices(deviceSession.userId, deviceSession.deviceId);
  }

  @UseGuards(RefreshGuard)
  @Delete(':deviceId')
  @HttpCode(204)
  async deleteSpecialDevice(
    @Param() deviceId: string,
    @Req() deviceSession: deviceDto,
  ) {
    const result = await this.devicesService.deleteSpecialDevice(deviceId, deviceSession);
    if (result.error !== null) throw new NotFoundException();
    return;
  }
}
