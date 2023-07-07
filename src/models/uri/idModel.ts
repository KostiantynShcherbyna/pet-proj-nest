import { IsString } from 'class-validator';

export class IdModel {
  @IsString()
  id: string;
}
