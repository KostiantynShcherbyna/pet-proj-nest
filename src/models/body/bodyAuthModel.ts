import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class BodyAuthModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  loginOrEmail: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string
}
