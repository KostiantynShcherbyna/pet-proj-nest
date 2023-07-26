import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator"
import { LikeStatus } from "../../utils/constants/constants"
import { Transform, TransformFnParams } from "class-transformer"

export class BodyLikeInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}
