import { IsNotEmpty, IsString } from "class-validator"

export class BodyAuthModel {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string

  @IsNotEmpty()
  @IsString()
  password: string
}
