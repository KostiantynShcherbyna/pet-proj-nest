import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, Validate } from "class-validator"
import { BlogWallpaperDecorator } from "../../../../../infrastructure/decorators/blog-wallpaper.decorator"
import { WALLPAPER_NORMAL_SIZE, WallpaperNormalTypes } from "../../../../../infrastructure/utils/constants"

export class WallpaperBodyInputModelSql {
  @IsNotEmpty()
  @IsString()
  originalname: string

  @IsNotEmpty()
  @Validate(BlogWallpaperDecorator, [100, 100])
  buffer: Buffer

  @IsNotEmpty()
  @IsEnum(WallpaperNormalTypes)
  mimetype: string // Добавьте тип файла (например, 'image/png')

  @IsNotEmpty()
  @IsNumber()
  @Max(WALLPAPER_NORMAL_SIZE)
  size: number // Добавьте максимальный размер файла в KB
}