import { UpdatePostBodyInputModel } from "../../../api/models/input/update-post.body.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { PostsRepository } from "../../../../posts/repository/mongoose/posts.repository"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

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
export class UpdatePost implements ICommandHandler<UpdatePostCommand> {
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
    }

    post.updatePost(updateDto, command.blogId)
    await this.postsRepository.saveDocument(post)

    return new Contract(true, null)
  }


}