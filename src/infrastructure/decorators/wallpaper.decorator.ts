import { Injectable, } from "@nestjs/common"
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator"
import { BlogsRepository } from "../../features/blogs/repository/mongoose/blogs.repository"
import sharp from "sharp"

@ValidatorConstraint({ name: "blog-wallpaper-decorator", async: true })
@Injectable()
export class WallpaperDecorator implements ValidatorConstraintInterface {
  constructor() {
  }

  async validate(imageBytes: Buffer, args: ValidationArguments) {
    const { constraints } = args
    const { size, height, width } = constraints[0]
    const metadata = await sharp(imageBytes).metadata()

    this.validateFormat(metadata.format, "png")
    this.validateSize(imageBytes, size)
    this.validateDimension({
      width: metadata.width,
      height: metadata.height,
      normalHeight: height,
      normalWidth: width,
    })

    return true
  }

  private validateFormat(format, type) {
    return format === type
  }

  private validateSize(imageBytes: Buffer, size: number) {
    return ((imageBytes.length / 1024) > size)
  }

  private validateDimension({ height, width, normalHeight, normalWidth }) {
    const result: any = []
    if (height !== 300) result.push({ height, message: `height don't have to be ${height}` })
    if (width !== 100) result.push({ width, message: `width don't have to be ${width}` })
    return result
  }
}