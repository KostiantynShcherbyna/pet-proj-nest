import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Blogs, BlogsModel } from "../../../../blogs/application/entities/mongoose/blogs.schema"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { BlogsRepositorySql } from "../../../../blogs/repository/sql/blogs.repository.sql"


export class BanBlogSqlCommand {
  constructor(
    public blogId: string,
    public isBanned: boolean,
  ) {
  }
}

@CommandHandler(BanBlogSqlCommand)
export class BanBlogSql implements ICommandHandler<BanBlogSqlCommand> {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    protected blogsRepositorySql: BlogsRepositorySql,
  ) {
  }

  async execute(command: BanBlogSqlCommand) {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.isBanned === command.isBanned)
      return new Contract(true, null)

    await this.blogsRepositorySql.setBanBlogBySA({
      blogId: command.blogId,
      isBanned: command.isBanned,
      banDate: new Date(Date.now()).toISOString()
    })

    return new Contract(true, null)
  }
}