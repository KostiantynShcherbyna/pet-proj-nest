import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { BlogEntity } from "../../../../blogs/application/entities/sql/blog.entity"
import { DataSource } from "typeorm"
import { saveFileUtil } from "../../../../../infrastructure/utils/save-file.util"
import { join } from "node:path"
import * as Buffer from "buffer"
import { ensureDirExists } from "../../../../../infrastructure/utils/ensure-dir-exists.util"
import { FilesStorageAdapter } from "../../../../../infrastructure/adapters/files-storage.adapter"
import { FilesS3StorageAdapter } from "../../../../../infrastructure/adapters/files-s3-storage.adapter"

export class UploadWallpaperS3CommandSql {
  constructor(
    public blogId: string,
    public userId: string,
    public fileName: string,
    public wallpaperBuffer: Buffer
  ) {
  }
}


@CommandHandler(UploadWallpaperS3CommandSql)
export class UploadWallpaperS3Sql implements ICommandHandler<UploadWallpaperS3CommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
    protected wallpaperS3Adapter: FilesS3StorageAdapter,
  ) {
  }

  async execute(command: UploadWallpaperS3CommandSql) {
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