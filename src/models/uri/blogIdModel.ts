import { IsString } from 'class-validator';

export class BlogIdModel {
  @IsString()
  blogId: string;
}
