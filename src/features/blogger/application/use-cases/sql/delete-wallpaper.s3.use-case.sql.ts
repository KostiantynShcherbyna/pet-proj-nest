import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { DataSource } from "typeorm"
import * as Buffer from "buffer"
import { DeleteFileS3Adapter } from "../../../../../infrastructure/adapters/delete-file.s3.adapter"

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
    protected deleteFileS3Adapter: DeleteFileS3Adapter,
  ) {
  }

  async execute(command: DeleteWallpaperS3CommandSql) {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)


    await this.deleteFileS3Adapter.execute(command.userId, "")
  }

}