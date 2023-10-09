import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { DataSource } from "typeorm"
import * as Buffer from "buffer"
import { FilesS3StorageAdapter } from "../../../../../infrastructure/adapters/files-s3-storage.adapter"

export class DeleteWallpaperS3CommandSql {
  constructor(
    public blogId: string,
    public userId: string,
  ) {
  }
}


@CommandHandler(DeleteWallpaperS3CommandSql)
export class DeleteWallpaperS3Sql implements ICommandHandler<DeleteWallpaperS3CommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
    protected wallpaperS3Adapter: FilesS3StorageAdapter,
  ) {
  }

  async execute(command: DeleteWallpaperS3CommandSql) {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)


    await this.wallpaperS3Adapter.deleteWallpaper(command.userId, "")
  }

}