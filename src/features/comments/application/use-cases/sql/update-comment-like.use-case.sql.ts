import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { CommentsRepositoryOrm } from "../../../repository/typeorm/comments.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"


export class UpdateCommentLikeCommandSql {
  constructor(
    public userId: string,
    public commentId: string,
    public newLikeStatus: string
  ) {
  }
}


@CommandHandler(UpdateCommentLikeCommandSql)
export class UpdateCommentLikeSql implements ICommandHandler<UpdateCommentLikeCommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected commentsRepositorySql: CommentsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
  ) {
  }

  async execute(command: UpdateCommentLikeCommandSql): Promise<Contract<boolean | null>> {

    const user = await this.usersRepositorySql.findUserByUserId(command.userId)
    if (!user || user.isConfirmed === false) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const comment = await this.commentsRepositorySql.findComment(command.commentId)
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

    const like = await this.commentsRepositorySql.findCommentLike({
      commentId: command.commentId,
      userId: command.userId
    })
    if (like && like.Status === command.newLikeStatus) return new Contract(true, null)

    // Create a new Like if there is no Like before or update Like if there is one
    const queryData = { status: command.newLikeStatus, commentId: command.commentId, userId: command.userId }
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      !like
        ? await this.commentsRepositorySql.createLike(queryData, queryRunner)
        : await this.commentsRepositorySql.updateLike(queryData, queryRunner)

      await queryRunner.commitTransaction()
      return new Contract(true, null)
    } catch (err) {
      console.log("UpdateCommentLikeSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.LIKE_NOT_UPDATED)
    } finally {
      await queryRunner.release()
    }
  }

}