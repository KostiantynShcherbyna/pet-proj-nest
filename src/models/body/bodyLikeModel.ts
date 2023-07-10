import { IsIn, IsNotEmpty, IsString } from "class-validator"
import { myStatusEnum } from "../../utils/constants/constants"

export class BodyLikeModel {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(myStatusEnum))
  likeStatus: myStatusEnum
}
