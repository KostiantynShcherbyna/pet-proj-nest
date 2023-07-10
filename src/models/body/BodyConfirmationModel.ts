import { IsString } from 'class-validator';

export class BodyConfirmationModel {
  @IsString()
  code: string;
}
