import { IsBoolean, IsNotEmpty } from "class-validator";

export class BodyBlogBanInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean
}

