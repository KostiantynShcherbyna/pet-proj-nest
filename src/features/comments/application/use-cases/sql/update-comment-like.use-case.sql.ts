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
    const queryData = { status: command.newLikeStatus, commentId: command.commentId, userId: command.userId }
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      if (!like) {
        await this.commentsRepositorySql.createLike(queryData, queryRunner)
        if (command.newLikeStatus === LikeStatus.Like)
          await this.commentsRepositorySql.setNoneToLike(command.commentId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.Dislike)
          await this.commentsRepositorySql.setNoneToDislike(command.commentId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.None)
          await this.commentsRepositorySql.setLikeToNone(command.commentId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.Dislike)
          await this.commentsRepositorySql.setLikeToDislike(command.commentId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.None)
          await this.commentsRepositorySql.setDislikeToNone(command.commentId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.Like)
          await this.commentsRepositorySql.setDislikeToLike(command.commentId, queryRunner)
      } else {
        await this.commentsRepositorySql.updateLike(queryData, queryRunner)
        if (like.myStatus === LikeStatus.None && command.newLikeStatus === LikeStatus.Like)
          await this.commentsRepositorySql.setNoneToLike(command.commentId, queryRunner)
        else if (like.myStatus === LikeStatus.None && command.newLikeStatus === LikeStatus.Dislike)
          await this.commentsRepositorySql.setNoneToDislike(command.commentId, queryRunner)
        else if (like.myStatus === LikeStatus.Like && command.newLikeStatus === LikeStatus.None)
          await this.commentsRepositorySql.setLikeToNone(command.commentId, queryRunner)
        else if (like.myStatus === LikeStatus.Like && command.newLikeStatus === LikeStatus.Dislike)
          await this.commentsRepositorySql.setLikeToDislike(command.commentId, queryRunner)
        else if (like.myStatus === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.None)
          await this.commentsRepositorySql.setDislikeToNone(command.commentId, queryRunner)
        else if (like.myStatus === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.Like)
          await this.commentsRepositorySql.setDislikeToLike(command.commentId, queryRunner)
      }

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