import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator"
import { LikeStatus } from "../../utils/constants/constants"
import { Transform, TransformFnParams } from "class-transformer"

export class BodyLikeInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}
