import { IsString } from 'class-validator';

export class BodyPostModel {
  @IsString()
  title: string;
  @IsString()
  shortDescription: string;
  @IsString()
  content: string;
  @IsString()
  blogId: string;
}
