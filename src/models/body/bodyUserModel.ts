import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class BodyUserModel {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
