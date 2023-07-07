import { IsString } from 'class-validator';

export class CommentIdModel {
  @IsString()
  id: string;
  @IsString()
  commentId: string;
}
