import { IsEmail, IsString } from 'class-validator';

export class BodyConfirmationResendModel {
  @IsString()
  @IsEmail()
  email: string;
}
