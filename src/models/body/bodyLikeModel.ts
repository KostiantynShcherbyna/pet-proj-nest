import { IsIn, IsNotEmpty, IsString } from "class-validator"
import { MyStatus } from "../../utils/constants/constants"

export class BodyLikeModel {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(MyStatus))
  likeStatus: MyStatus
}
