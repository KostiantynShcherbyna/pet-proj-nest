import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Blogs, BlogsModel } from "../../../../blogger/application/entities/mongoose/blogs.schema"
import { BlogsRepository } from "../../../../../repositories/blogs/mongoose/blogs.repository"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Contract } from "../../../../../infrastructure/utils/contract"


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
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: BanBlogSqlCommand) {

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.banInfo.isBanned === command.isBanned)
      return new Contract(true, null)


    command.isBanned === true
      ? foundBlog.banBlog()
      : foundBlog.unbanBlog()

    await this.blogsRepository.saveDocument(foundBlog)

    return new Contract(true, null)
  }
}