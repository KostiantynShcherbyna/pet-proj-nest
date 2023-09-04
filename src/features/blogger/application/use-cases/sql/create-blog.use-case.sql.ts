import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../../sa/repository/orm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/orm/blogs.repository.orm"

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
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
  ) {
  }

  //  : Promise<Contract<null | string>>
  async execute(command: CreateBlogCommandSql) {
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