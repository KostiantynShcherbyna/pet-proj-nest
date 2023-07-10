import { IsEmail, IsString, Matches } from "class-validator"
import { EMAIL_REGISTRATION_REGEX } from "../../utils/constants/constants"

export class BodyConfirmationResendModel {
  @IsString()
  @IsEmail()
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string;
}
