import { IsString } from 'class-validator';

export class BodyCommentModel {
  @IsString()
  content: string;
}
