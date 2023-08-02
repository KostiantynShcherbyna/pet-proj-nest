import { IsEmail, IsString, Matches } from "class-validator"
import { EMAIL_REGISTRATION_REGEX } from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer";

export class BodyConfirmationResendInputModel {
  @IsString()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string;
}
