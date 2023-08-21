import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Blogs, BlogsDocument, BlogsModel } from "../../../../blogs/application/entities/mongoose/blogs.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { UsersRepository } from "../../../../sa/repository/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { CreateBloggerBlogOutputModel } from "../../../api/models/output/create-blogger-blog.output-model"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Types } from "mongoose"
import { UsersRepositorySql } from "../../../../sa/repository/sql/users.repository.sql"
import { BlogsRepositorySql } from "../../../../blogs/repository/sql/blogs.repository.sql"

export class CreateBlogCommandSql {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
  ) {
  }
}


@CommandHandler(CreateBlogCommandSql)
export class CreateBlogBloggerSql implements ICommandHandler<CreateBlogCommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositorySql,
    protected usersRepositorySql: UsersRepositorySql,
  ) {
  }

  async execute(command: CreateBlogCommandSql): Promise<Contract<null | string>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const foundUser = await this.usersRepositorySql.findUserByUserId(command.userId)
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const newBlogId = await this.blogsRepositorySql.createBlog(
      command,
      foundUser.login,
    )
    return new Contract(newBlogId, null)
  }

}