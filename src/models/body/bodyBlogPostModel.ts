import { IsString } from 'class-validator';

export class BodyBlogPostModel {
  @IsString()
  title: string;
  @IsString()
  shortDescription: string;
  @IsString()
  content: string;
}
