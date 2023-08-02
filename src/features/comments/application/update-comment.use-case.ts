import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/infrastructure/utils/contract"
import { CommentsRepository } from "src/features/comments/infrastructure/comments.repository"
import { PostsCommentsRepository } from "src/features/blogger/infrastructure/posts-comments.repository"
import { UsersRepository } from "src/features/users/infrastructure/users.repository"
import { PostsComments, PostsCommentsModel } from "src/infrastructure/schemas/posts-comments.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class UpdateCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public content: string
  ) {
  }
}


@CommandHandler(UpdateCommentCommand)
export class UpdateComment implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
    protected postsCommentsRepository: PostsCommentsRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: UpdateCommentCommand): Promise<Contract<null | boolean>> {
    // Looking for a comment and check owner
    const comment = await this.commentsRepository.findComment(command.commentId)
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (comment.checkCommentator(command.userId) === false) return new Contract(null, ErrorEnums.FOREIGN_COMMENT)


    const postComment = await this.postsCommentsRepository.findPostComment(command.commentId)
    if (postComment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (postComment.commentatorInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT)


    comment.updateComment(command.content)
    // postComment.updatePostComments(command.content);


    await this.commentsRepository.saveDocument(comment)
    await this.postsCommentsRepository.saveDocument(postComment)

    return new Contract(true, null)
  }


}