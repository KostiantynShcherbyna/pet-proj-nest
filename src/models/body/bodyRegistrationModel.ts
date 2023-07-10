import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator"
import {
  EMAIL_REGISTRATION_REGEX,
  LOGIN_MAX_LENGTH,
  LOGIN_MIN_LENGTH,
  LOGIN_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH
} from "../../utils/constants/constants"

export class BodyRegistrationModel {
  @IsString()
  @IsNotEmpty()
  @Length(LOGIN_MIN_LENGTH, LOGIN_MAX_LENGTH)
  @Matches(LOGIN_REGEX)
  login: string

  @IsString()
  @IsNotEmpty()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  password: string

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string
}
