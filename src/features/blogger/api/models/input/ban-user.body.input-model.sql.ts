import { Transform } from "class-transformer"
import { IsBoolean, IsNotEmpty, IsString, IsUUID, MinLength, Validate } from "class-validator"
import { trimValue } from "../../../../../infrastructure/decorators/trim.decorator"
import { BAN_REASON_MIN_LENGTH } from "../../../../../infrastructure/utils/constants"
import { BlogIdIsExistSql } from "../../../../../infrastructure/decorators/blogId.decorator.sql"


export class BanUserBodyInputModelSql {
  // @Transform(({ value }) => trimValue(value, "isBanned"))
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean

  @Transform(({ value }) => trimValue(value, "banReason"))
  @IsString()
  @IsNotEmpty()
  @MinLength(BAN_REASON_MIN_LENGTH)
  banReason: string

  @Transform(({ value }) => trimValue(value, "blogId"))
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @Validate(BlogIdIsExistSql)
  blogId: string
}

