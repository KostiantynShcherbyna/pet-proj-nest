import { IsEmail, IsString } from 'class-validator';

export class BodyPasswordRecoveryModel {
  @IsString()
  @IsEmail()
  email: string;
}
