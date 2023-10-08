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
import { StorageFilesAdapter } from "../../../../../infrastructure/adapters/storage-files.adapter"

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
    protected filesStorageAdapter: StorageFilesAdapter,
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