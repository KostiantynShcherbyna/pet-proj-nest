import { IsString } from 'class-validator';

export class BodyRegistrationConfirmationModel {
  @IsString()
  code: string;
}
