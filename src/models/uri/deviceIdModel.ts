import { IsString } from 'class-validator';

export class DeviceIdModel {
  @IsString()
  deviceId: string;
}
