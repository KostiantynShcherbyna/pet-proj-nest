import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Blogs, BlogsModel } from "../entity/blogs.schema"
import { Posts, PostsModel } from "../entity/posts.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BlogsRepository } from "../../../blogs/infrastructure/blogs.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"

export class DeleteBlogCommand {
  constructor(
    public blogId: string,
    public userId: string
  ) {
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogBlogger implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: DeleteBlogCommand): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const deleteBlogContract = await Blogs.deleteBlog(
      command.blogId,
      this.BlogsModel,
      this.PostsModel
    )
    if (deleteBlogContract.error !== null)
      return new Contract(null, deleteBlogContract.error)

    return new Contract(true, null)
  }
}