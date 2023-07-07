import { IsString } from 'class-validator';

export class BodyNewPasswordModel {
  @IsString()
  newPassword: string;
  @IsString()
  recoveryCode: string;
}
