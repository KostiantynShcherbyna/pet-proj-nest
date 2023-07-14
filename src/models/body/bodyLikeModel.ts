import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator"
import { MyStatus } from "../../utils/constants/constants"

export class BodyLikeModel {
  @IsString()
  @IsNotEmpty()
  @IsEnum(MyStatus)
  likeStatus: MyStatus
}
