import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer"
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"

export class LikeStatusBodyInputModel {
  @Transform(({ value }) => trimValue(value, "likeStatus"))
  @IsString()
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}
