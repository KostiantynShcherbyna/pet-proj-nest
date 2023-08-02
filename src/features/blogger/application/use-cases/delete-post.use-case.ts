import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/infrastructure/utils/contract"
import { BlogsRepository } from "src/features/blogs/infrastructure/blogs.repository"
import { PostsRepository } from "src/features/posts/infrastructure/posts.repository"
import { Posts, PostsModel } from "src/features/blogger/application/entity/posts.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class DeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostBlogger implements ICommandHandler<DeletePostCommand> {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: DeletePostCommand): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)


    const post = await this.postsRepository.findPost(command.postId)
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)
    if (post.blogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_POST)

    // const deletedPostResult = await this.PostsModel.deleteOne({ _id: new Types.ObjectId(command.postId) })
    const deletedPostResult = await Posts.deletePost(
      command.postId,
      this.PostsModel
    )
    if (deletedPostResult === 0)
      return new Contract(null, ErrorEnums.POST_NOT_DELETED)

    return new Contract(true, null)
  }

}