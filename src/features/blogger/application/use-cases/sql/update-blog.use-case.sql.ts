import { UpdateBlogBodyInputModel } from "../../../api/models/input/update-blog.body.input-model"
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { DataSource } from "typeorm"


export class UpdateBlogCommandSql {
  constructor(
    public blogId: string,
    public bodyBlog: UpdateBlogBodyInputModel,
    public userId: string,
  ) {
  }
}

@CommandHandler(UpdateBlogCommandSql)
export class UpdateBlogSql implements ICommandHandler<UpdateBlogCommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async execute(command: UpdateBlogCommandSql): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const blog = await this.blogsRepositorySql.findBlogEntity(command.blogId)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (blog.UserId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    blog.updateBlog(command.bodyBlog)
    await this.dataSource.manager.transaction(async manager => await manager.save(blog))
    blog.getUncommittedEvents().forEach(e => this.eventBus.publish(e))

    return new Contract(true, null)
  }
}