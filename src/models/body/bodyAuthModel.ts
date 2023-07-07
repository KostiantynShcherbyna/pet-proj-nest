import { IsString } from 'class-validator';

export class BodyAuthModel {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}
