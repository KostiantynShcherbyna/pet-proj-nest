import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Comments, CommentsModel } from "../../entities/mongoose/comments.schema"
import { PostsComments, PostsCommentsModel } from "../../../../posts/application/entites/mongoose/posts-comments.schema"
import { PostsCommentsRepository } from "../../../../blogger/repository/mongoose/posts-comments.repository"
import { UsersRepository } from "../../../../sa/repository/mongoose/users.repository"
import { CommentsRepository } from "../../../repository/mongoose/comments.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"


export class DeleteCommentCommandSql {
  constructor(
    public userId: string,
    public commentId: string
  ) {
  }
}


@CommandHandler(DeleteCommentCommandSql)
export class DeleteCommentSql implements ICommandHandler<DeleteCommentCommandSql> {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
    protected postsCommentsRepository: PostsCommentsRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: DeleteCommentCommandSql): Promise<Contract<null | boolean>> {
    // Looking for a comment and check owner
    // const foundUser = await this.usersRepository.findUser(["_id", new Types.ObjectId(command.userId)])
    // if (foundUser === null)
    //   return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    // if (foundUser.accountData.banInfo.isBanned === true)
    //   return new Contract(null, ErrorEnums.USER_IS_BANNED)


    const comment = await this.commentsRepository.findComment(command.commentId)
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (comment.commentatorInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT)

    const postComment = await this.postsCommentsRepository.findPostComment(command.commentId)
    if (postComment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (postComment.commentatorInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT)


    const deleteCommentContract = await Comments.deleteComment(command.commentId, this.CommentsModel)
    if (deleteCommentContract.data === 0) return new Contract(null, ErrorEnums.COMMENT_NOT_DELETE)

    const deletePostCommentResult = await PostsComments.deletePostComments(command.commentId, this.PostsCommentsModel)
    if (deletePostCommentResult === 0) return new Contract(null, ErrorEnums.POST_COMMENT_NOT_DELETE)

    return new Contract(true, null)
  }


}