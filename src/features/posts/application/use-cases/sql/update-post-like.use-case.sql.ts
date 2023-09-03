import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { PostsRepositoryOrm } from "../../../repository/orm/posts.repository.orm"
import { UsersRepositorySql } from "../../../../sa/repository/sql/users.repository.sql"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"


export class UpdatePostLikeCommandSql {
  constructor(
    public userId: string,
    public postId: string,
    public newLikeStatus: string,
  ) {
  }
}

@CommandHandler(UpdatePostLikeCommandSql)
export class UpdatePostLikeSql implements ICommandHandler<UpdatePostLikeCommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postsRepositorySql: PostsRepositoryOrm,
    protected usersRepositorySql: UsersRepositorySql,
  ) {
  }

  async execute(command: UpdatePostLikeCommandSql) {
    const post = await this.postsRepositorySql.findPost(command.postId)
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const user = await this.usersRepositorySql.findUserByUserId(command.userId)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    // Create a new Like if there is no Like before or update Like if there is one
    const like = await this.postsRepositorySql.findPostLike({
      postId: command.postId,
      userId: command.userId
    })
    if (like && like.myStatus === command.newLikeStatus) return new Contract(true, null)

    // Create a new Like if there is no Like before or update Like if there is one

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      !like
        ? await this.postsRepositorySql.createLike({
          status: command.newLikeStatus,
          userId: command.userId,
          userLogin: user.login,
          postId: command.postId,
          addedAt: new Date(Date.now()).toISOString()
        }, queryRunner)
        : await this.postsRepositorySql.updateLike({
          status: command.newLikeStatus,
          postId: command.postId,
          userId: command.userId
        }, queryRunner)
      await queryRunner.commitTransaction()
      return new Contract(true, null)

    } catch (err) {
      console.log("UpdatePostLikeSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.LIKE_NOT_UPDATED)
    } finally {
      await queryRunner.release()
    }


  }

}