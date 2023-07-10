import { IsNotEmpty, IsString, Length } from "class-validator"
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../../utils/constants/constants"

export class BodyNewPasswordModel {
  @IsString()
  @IsNotEmpty()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
