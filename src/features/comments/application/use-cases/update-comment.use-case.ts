import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { PostsComments, PostsCommentsModel } from "../../../entities/mongoose/posts-comments.schema"
import { PostsCommentsRepository } from "../../../blogger/infrastructure/posts-comments.repository"
import { CommentsRepository } from "../../infrastructure/comments.repository"
import { UsersRepository } from "../../../super-admin/infrastructure/users.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"


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