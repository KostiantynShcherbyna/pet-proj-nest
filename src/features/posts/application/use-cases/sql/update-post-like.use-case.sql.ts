import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { PostsRepositorySql } from "../../../repository/sql/posts.repository.sql"
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
    protected postsRepositorySql: PostsRepositorySql,
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
    const queryData = { postId: command.postId, userId: command.userId }
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      !like
        ? await this.postsRepositorySql.createLike({
          status: command.newLikeStatus,
          postId: command.postId,
          userId: command.userId
        }, queryRunner)
        : await this.postsRepositorySql.updateLike({
          status: command.newLikeStatus,
          postId: command.postId,
          userId: command.userId
        }, queryRunner)

      if (like.status === LikeStatus.None && command.newLikeStatus === LikeStatus.Like)
        await this.postsRepositorySql.setNoneToLike(queryData, queryRunner)
      else if (like.status === LikeStatus.None && command.newLikeStatus === LikeStatus.Dislike)
        await this.postsRepositorySql.setNoneToDislike(queryData, queryRunner)
      else if (like.status === LikeStatus.Like && command.newLikeStatus === LikeStatus.None)
        await this.postsRepositorySql.setLikeToNone(queryData, queryRunner)
      else if (like.status === LikeStatus.Like && command.newLikeStatus === LikeStatus.Dislike)
        await this.postsRepositorySql.setLikeToDislike(queryData, queryRunner)
      else if (like.status === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.None)
        await this.postsRepositorySql.setDislikeToNone(queryData, queryRunner)
      else if (like.status === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.Like)
        await this.postsRepositorySql.setDislikeToLike(queryData, queryRunner)

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