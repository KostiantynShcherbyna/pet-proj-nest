import { IsEmail, IsString } from 'class-validator';

export class BodyEmailModel {
  @IsString()
  service: string;
  @IsString()
  user: string;
  @IsString()
  pass: string;
  @IsString()
  from: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  subject: string;
  @IsString()
  message: string;
}
