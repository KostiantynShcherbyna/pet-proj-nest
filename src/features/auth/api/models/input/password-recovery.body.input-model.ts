import { IsEmail, IsString, Matches } from "class-validator"
import { EMAIL_REGISTRATION_REGEX } from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer";
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"

export class PasswordRecoveryBodyInputModel {
  @Transform(({ value }) => trimValue(value, "email"))
  @IsString()
  @IsEmail()
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string;
}
