import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer"

export class LikeStatusBodyInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}
