import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { CommentsRepositoryOrm } from "../../../repository/orm/comments.repository.orm"
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
    protected commentsRepositorySql: CommentsRepositoryOrm,
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