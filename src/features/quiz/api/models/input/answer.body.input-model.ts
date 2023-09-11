import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class AnswerBodyInputModel {
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  answer: string
}
