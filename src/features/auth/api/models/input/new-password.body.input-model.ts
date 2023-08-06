import { IsNotEmpty, IsString, Length } from "class-validator"
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer"
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"

export class NewPasswordBodyInputModel {
  @Transform(({ value }) => trimValue(value, "newPassword"))
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  newPassword: string

  @Transform(({ value }) => trimValue(value, "recoveryCode"))
  @IsString()
  @IsNotEmpty()
  recoveryCode: string
}
