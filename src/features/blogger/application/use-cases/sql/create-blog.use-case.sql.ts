import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { BlogEntity } from "../../../../blogs/application/entities/sql/blog.entity"
import { DataSource } from "typeorm"

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
    protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
  ) {
  }

  async execute(command: CreateBlogCommandSql) {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const foundUser = await this.usersRepositorySql.findUserByUserId(command.userId)
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const newBlog = BlogEntity.createBlog(command, foundUser.login)
    const savedBlog = await this.dataSource.manager.transaction(
      async manager => await this.blogsRepositorySql.saveBlog(newBlog, manager))
    newBlog.getUncommittedEvents().forEach(e => this.eventBus.publish(e))

    return new Contract(savedBlog.BlogId, null)
  }

}