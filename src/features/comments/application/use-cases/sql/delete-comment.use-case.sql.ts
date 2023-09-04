import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Comments, CommentsModel } from "../../entities/mongoose/comments.schema"
import { PostsComments, PostsCommentsModel } from "../../../../posts/application/entites/mongoose/posts-comments.schema"
import { PostsCommentsRepository } from "../../../../blogger/repository/mongoose/posts-comments.repository"
import { UsersRepository } from "../../../../sa/repository/mongoose/users.repository"
import { CommentsRepository } from "../../../repository/mongoose/comments.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { CommentsRepositoryOrm } from "../../../repository/orm/comments.repository.orm"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"


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
    @InjectDataSource() protected dataSource: DataSource,
    protected commentsRepositorySql: CommentsRepositoryOrm,
  ) {
  }

  async execute(command: DeleteCommentCommandSql): Promise<Contract<null | boolean>> {
    // Looking for a comment and check owner
    // const foundUser = await this.usersRepository.findUser(["_id", new Types.ObjectId(command.userId)])
    // if (foundUser === null)
    //   return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    // if (foundUser.accountData.banInfo.isBanned === true)
    //   return new Contract(null, ErrorEnums.USER_IS_BANNED)


    const comment = await this.commentsRepositorySql.findComment(command.commentId)
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (comment.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.commentsRepositorySql.deleteLike(command.commentId, queryRunner)
      await this.commentsRepositorySql.deleteComment(command.commentId, queryRunner)
      await queryRunner.commitTransaction()
      return new Contract(true, null)
    } catch (err) {
      console.log("DeleteCommentSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.COMMENT_NOT_DELETE)
    } finally {
      await queryRunner.release()
    }

  }


}