import { IsEmail, IsString, Matches } from 'class-validator';
import { EMAIL_REGISTRATION_REGEX } from 'src/utils/constants/constants';

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
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}
