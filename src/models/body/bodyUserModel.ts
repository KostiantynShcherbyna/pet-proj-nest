import { IsEmail, IsString } from 'class-validator';

export class BodyUserModel {
  @IsString()
  login: string;
  @IsString()
  password: string;
  @IsString()
  @IsEmail()
  email: string;
}
