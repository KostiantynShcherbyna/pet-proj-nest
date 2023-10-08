import { IsNotEmpty, IsNumber, IsString, Validate } from "class-validator"
import { WallpaperDecorator } from "../../../../../infrastructure/decorators/wallpaper.decorator"

export class WallpaperBodyInputModelSql {
  // @IsNotEmpty()
  // @IsString()
  // blogId: string; // Замените на нужный тип данных для вашего blogId

  @IsNotEmpty()
  originalname: string

  @IsNotEmpty()
  @Validate(WallpaperDecorator, [{ size: 1000, height: 100, width: 100 }])
  buffer: Buffer

  // Добавьте другие проверки, например, для типа файла и размера
  @IsNotEmpty()
  @IsString()
  fileType: string // Добавьте тип файла (например, 'image/png')

  @IsNotEmpty()
  @IsNumber()
  size: number // Добавьте максимальный размер файла в KB
}