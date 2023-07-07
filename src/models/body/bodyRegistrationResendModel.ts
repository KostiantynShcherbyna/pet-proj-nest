import { IsEmail, IsString } from 'class-validator';

export class BodyRegistrationConfirmationResendModel {
  @IsString()
  @IsEmail()
  email: string;
}
