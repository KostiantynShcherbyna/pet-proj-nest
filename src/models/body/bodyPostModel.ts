import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH } from "src/utils/constants/constants";

export class BodyPostModel {
  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTS_TITLE_MAX_LENGTH)
  title: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTS_SHORTDESCRIPTION_MAX_LENGTH)
  shortDescription: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTS_CONTENT_MAX_LENGTH)
  content: string;
  
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
