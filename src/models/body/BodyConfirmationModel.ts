import { IsNotEmpty, IsString } from "class-validator"

export class BodyConfirmationModel {
  @IsString()
  @IsNotEmpty()
  code: string
}
