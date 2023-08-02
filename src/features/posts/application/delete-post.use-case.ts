import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/infrastructure/utils/contract"
import { PostsComments, PostsCommentsModel } from "src/infrastructure/schemas/posts-comments.schema"
import { Posts, PostsModel } from "src/infrastructure/schemas/posts.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class DeletePostCommand {
  constructor(
    public id: string
  ) {
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePost implements ICommandHandler<DeletePostCommand> {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
  ) {
  }

  async execute(command: DeletePostCommand): Promise<Contract<null | boolean>> {


    // const deletedPostResult = await this.PostsModel.deleteOne({ _id: new Types.ObjectId(command.id) })
    const deletePostResult = await Posts.deletePost(
      command.id,
      this.PostsModel
    )
    if (deletePostResult === 0)
      return new Contract(null, ErrorEnums.POST_NOT_DELETED)

    const deletePostCommentResult = await PostsComments.deletePostComments(
      command.id,
      this.PostsCommentsModel
    )
    if (deletePostCommentResult === 0)
      return new Contract(null, ErrorEnums.POST_NOT_DELETED)

    return new Contract(true, null)
  }

}