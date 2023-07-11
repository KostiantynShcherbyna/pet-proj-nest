import { IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator"
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX
} from "../../utils/constants/constants";

export class BodyBlogModel {
  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(BLOGS_DESCRIPTION_MAX_LENGTH)
  @Matches(BLOGS_WEBSITEURL_REGEX)
  websiteUrl: string;
}
