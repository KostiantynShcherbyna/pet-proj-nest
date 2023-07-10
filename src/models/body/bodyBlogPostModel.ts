import { IsNotEmpty, IsString, Length } from 'class-validator';
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH } from 'src/utils/constants/constants';

export class BodyBlogPostModel {
  @IsString()
  @IsNotEmpty()
  @Length(0, POSTS_TITLE_MAX_LENGTH)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, POSTS_SHORTDESCRIPTION_MAX_LENGTH)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, POSTS_CONTENT_MAX_LENGTH)
  content: string;
}
