import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { DataSource } from "typeorm"
import * as Buffer from "buffer"
import { FilesStorageAdapter } from "../../../../../infrastructure/adapters/files-storage.adapter"
import { FilesS3StorageAdapter } from "../../../../../infrastructure/adapters/files-s3-storage.adapter"

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
    protected filesStorageAdapter: FilesStorageAdapter,
  ) {
  }

  async execute(command: UploadWallpaperCommandSql) {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    await this.filesStorageAdapter.saveWallpaper({
      blogId: command.blogId,
      fileName: command.fileName,
      wallpaperBuffer: command.wallpaperBuffer,
    })

  }
}