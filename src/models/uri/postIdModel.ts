import { IsString } from 'class-validator';

export class PostIdModel {
  @IsString()
  postId: string;
}
