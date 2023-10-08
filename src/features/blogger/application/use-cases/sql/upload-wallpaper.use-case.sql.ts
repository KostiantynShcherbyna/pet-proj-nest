import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { DataSource } from "typeorm"
import * as Buffer from "buffer"
import { StorageFilesAdapter } from "../../../../../infrastructure/adapters/storage-files.adapter"
import { WallpaperS3Adapter } from "../../../../../infrastructure/adapters/wallpaper.s3.adapter"

export class UploadWallpaperCommandSql {
  constructor(
    public blogId: string,
    public userId: string,
    public fileName: string,
    public wallpaperBuffer: Buffer
  ) {
  }
}


@CommandHandler(UploadWallpaperCommandSql)
export class UploadWallpaperSql implements ICommandHandler<UploadWallpaperCommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
    protected wallpaperS3Adapter: WallpaperS3Adapter,
  ) {
  }

  async execute(command: UploadWallpaperCommandSql) {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)
    const relativeFolderPath = await this.wallpaperS3Adapter.saveWallpaper({
      userId: command.userId,
      blogId: command.blogId,
      fileName: command.fileName,
      wallpaperBuffer: command.wallpaperBuffer,
    })

    return {
      wallpaper: {
        url: relativeFolderPath,
        width: 0,
        height: 0,
        fileSize: 0
      },
    }
  }


}