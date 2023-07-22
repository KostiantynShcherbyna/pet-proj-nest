import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class BodyConfirmationInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string
}
