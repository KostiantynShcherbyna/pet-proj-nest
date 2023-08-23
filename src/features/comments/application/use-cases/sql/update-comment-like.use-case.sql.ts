import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { PostsComments, PostsCommentsModel } from "../../../../posts/application/entites/mongoose/posts-comments.schema"
import { PostsCommentsRepository } from "../../../../blogger/repository/mongoose/posts-comments.repository"
import { CommentsRepository } from "../../../repository/mongoose/comments.repository"
import { UsersRepository } from "../../../../sa/repository/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { CommentsRepositorySql } from "../../../repository/sql/comments.repository.sql"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"


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
    protected commentsRepositorySql: CommentsRepositorySql,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: UpdateCommentLikeCommandSql): Promise<Contract<boolean | null>> {

    const comment = await this.commentsRepositorySql.findComment(command.commentId)
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

    const like = await this.commentsRepositorySql.findCommentLike({
      commentId: command.commentId,
      userId: command.userId
    })
    if (like && like.myStatus === command.newLikeStatus) return new Contract(true, null)

    // Create a new Like if there is no Like before or update Like if there is one
    const queryData = { commentId: command.commentId, userId: command.userId }
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      !like
        ? await this.commentsRepositorySql.createLike({
          status: command.newLikeStatus,
          commentId: command.commentId,
          userId: command.userId
        }, queryRunner)
        : await this.commentsRepositorySql.updateLike({
          status: command.newLikeStatus,
          commentId: command.commentId,
          userId: command.userId
        }, queryRunner)

      if (like.status === LikeStatus.None && command.newLikeStatus === LikeStatus.Like)
        await this.commentsRepositorySql.setNoneToLike(queryData, queryRunner)
      else if (like.status === LikeStatus.None && command.newLikeStatus === LikeStatus.Dislike)
        await this.commentsRepositorySql.setNoneToDislike(queryData, queryRunner)
      else if (like.status === LikeStatus.Like && command.newLikeStatus === LikeStatus.None)
        await this.commentsRepositorySql.setLikeToNone(queryData, queryRunner)
      else if (like.status === LikeStatus.Like && command.newLikeStatus === LikeStatus.Dislike)
        await this.commentsRepositorySql.setLikeToDislike(queryData, queryRunner)
      else if (like.status === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.None)
        await this.commentsRepositorySql.setDislikeToNone(queryData, queryRunner)
      else if (like.status === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.Like)
        await this.commentsRepositorySql.setDislikeToLike(queryData, queryRunner)

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