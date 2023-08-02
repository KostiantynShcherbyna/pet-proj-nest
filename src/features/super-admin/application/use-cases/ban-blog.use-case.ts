import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/infrastructure/utils/contract"
import { BlogsRepository } from "src/features/blogs/infrastructure/blogs.repository"
import { Blogs, BlogsModel } from "src/features/blogger/application/entity/blogs.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class BanBlogCommand {
  constructor(
    public blogId: string,
    public isBanned: boolean,
  ) {
  }
}

@CommandHandler(BanBlogCommand)
export class BanBlog implements ICommandHandler<BanBlogCommand> {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: BanBlogCommand) {

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