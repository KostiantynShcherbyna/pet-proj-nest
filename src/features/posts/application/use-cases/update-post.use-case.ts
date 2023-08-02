import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/infrastructure/utils/contract"
import { UpdatePostBodyInputModel } from "src/features/posts/api/models/input/update-post.body.input-model"
import { PostsRepository } from "src/features/posts/infrastructure/posts.repository"
import { PostsComments, PostsCommentsModel } from "src/infrastructure/schemas/posts-comments.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class UpdatePostCommand {
  constructor(
    public body: UpdatePostBodyInputModel,
    public id: string
  ) {
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePost implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
    protected postsRepository: PostsRepository,
  ) {
  }

  async execute(command: UpdatePostCommand): Promise<Contract<null | boolean>> {

    const post = await this.postsRepository.findPost(command.id)
    if (post === null)
      return new Contract(null, ErrorEnums.POST_NOT_FOUND)


    // const postComments = await this.postsCommentsRepository.findPostComments(["postInfo.id", command.id]);
    // if (postComments === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);


    post.updatePost(command.body)
    await this.postsRepository.saveDocument(post)

    const updatePostCommentsResult = await this.PostsCommentsModel.updatePostComments(
      post._id.toString(),
      this.PostsCommentsModel
    )
    if (updatePostCommentsResult === 0)
      return new Contract(null, ErrorEnums.POST_NOT_FOUND)


    return new Contract(true, null)
  }


}