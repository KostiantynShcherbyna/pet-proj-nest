import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator"
import { MyStatus } from "../../utils/constants/constants"
import { Transform, TransformFnParams } from "class-transformer"

export class BodyLikeModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEnum(MyStatus)
  likeStatus: MyStatus
}
