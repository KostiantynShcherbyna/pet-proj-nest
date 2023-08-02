import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength, matches } from "class-validator";
import { BAN_REASON_MIN_LENGTH, EMAIL_REGISTRATION_REGEX, LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH, LOGIN_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "src/infrastructure/utils/constants";
import { trimValue } from "src/infrastructure/decorators/trim.decorator";

export class BanUserBodyInputModel {
  // @Transform(({ value }) => trimValue(value, "isBanned"))
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean

  @Transform(({ value }) => trimValue(value, "banReason"))
  @IsString()
  @IsNotEmpty()
  @MinLength(BAN_REASON_MIN_LENGTH)
  banReason: string

}

