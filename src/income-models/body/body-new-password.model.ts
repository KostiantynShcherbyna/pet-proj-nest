import { IsNotEmpty, IsString, Length } from "class-validator"
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../../utils/constants/constants"
import { Transform, TransformFnParams } from "class-transformer";

export class BodyNewPasswordModel {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  recoveryCode: string;
}
