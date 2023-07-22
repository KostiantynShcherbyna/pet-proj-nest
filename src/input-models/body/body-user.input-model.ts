import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, matches } from "class-validator";
import { EMAIL_REGISTRATION_REGEX, LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH, LOGIN_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "src/utils/constants/constants";

export class BodyUserInputModel {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(LOGIN_MIN_LENGTH, LOGIN_MAX_LENGTH)
  @Matches(LOGIN_REGEX)
  login: string;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string;
}
