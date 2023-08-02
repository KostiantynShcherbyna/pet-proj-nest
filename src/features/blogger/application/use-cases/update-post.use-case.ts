import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/infrastructure/utils/contract"
import { UpdatePostBodyInputModel } from "src/features/blogger/api/models/input/update-post.body.input-model"
import { BlogsRepository } from "src/features/blogs/infrastructure/blogs.repository"
import { PostsRepository } from "src/features/posts/infrastructure/posts.repository"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class UpdatePostCommand {
  constructor(
    public body: UpdatePostBodyInputModel,
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostBlogger implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: UpdatePostCommand): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const post = await this.postsRepository.findPost(command.postId)
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)
    if (post.blogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_POST)

    const updateDto = {
      title: command.body.title,
      shortDescription: command.body.shortDescription,
      content: command.body.content,
      blogId: command.blogId,
    }

    post.updatePost(updateDto)
    await this.postsRepository.saveDocument(post)

    return new Contract(true, null)
  }


}