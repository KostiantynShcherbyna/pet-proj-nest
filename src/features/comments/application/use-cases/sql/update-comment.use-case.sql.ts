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


export class UpdateCommentCommandSql {
  constructor(
    public userId: string,
    public commentId: string,
    public content: string
  ) {
  }
}


@CommandHandler(UpdateCommentCommandSql)
export class UpdateCommentSql implements ICommandHandler<UpdateCommentCommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected commentsRepositorySql: CommentsRepositorySql,
  ) {
  }

  async execute(command: UpdateCommentCommandSql): Promise<Contract<null | boolean>> {
    // Looking for a comment and check owner
    const comment = await this.commentsRepositorySql.findComment(command.commentId)
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (comment.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.commentsRepositorySql.updateComment({
        commentId: command.commentId,
        content: command.content
      }, queryRunner)
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log("UpdateCommentSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.COMMENT_NOT_UPDATED)
    } finally {
      await queryRunner.release()
    }
    return new Contract(true, null)
  }


}