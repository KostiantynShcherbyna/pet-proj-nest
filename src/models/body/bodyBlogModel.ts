import { IsString } from 'class-validator';

export class BodyBlogModel {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  websiteUrl: string;
}
