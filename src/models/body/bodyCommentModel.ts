import { IsNotEmpty, IsString } from "class-validator";

export class BodyCommentModel {
  @IsString()
  @IsNotEmpty()
  content: string;
}
