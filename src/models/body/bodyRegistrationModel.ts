import { IsEmail, IsString } from 'class-validator';

export class BodyRegistrationModel {
  @IsString()
  login: string;
  @IsString()
  password: string;
  @IsString()
  @IsEmail()
  email: string;
}
