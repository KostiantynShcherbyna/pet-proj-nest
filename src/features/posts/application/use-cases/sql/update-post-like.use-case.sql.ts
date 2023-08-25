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

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      if (!like) {
        await this.postsRepositorySql.createLike({
          status: command.newLikeStatus,
          userId: command.userId,
          userLogin: user.login,
          postId: command.postId,
          addedAt: new Date(Date.now()).toISOString()
        }, queryRunner)

        if (command.newLikeStatus === LikeStatus.Like)
          await this.postsRepositorySql.setNoneToLike(command.postId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.Dislike)
          await this.postsRepositorySql.setNoneToDislike(command.postId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.None)
          await this.postsRepositorySql.setLikeToNone(command.postId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.Dislike)
          await this.postsRepositorySql.setLikeToDislike(command.postId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.None)
          await this.postsRepositorySql.setDislikeToNone(command.postId, queryRunner)
        else if (command.newLikeStatus === LikeStatus.Like)
          await this.postsRepositorySql.setDislikeToLike(command.postId, queryRunner)

      } else {
        await this.postsRepositorySql.updateLike({
          status: command.newLikeStatus,
          postId: command.postId,
          userId: command.userId
        }, queryRunner)

        if (like.status === LikeStatus.None && command.newLikeStatus === LikeStatus.Like)
          await this.postsRepositorySql.setNoneToLike(command.postId, queryRunner)
        else if (like.myStatus === LikeStatus.None && command.newLikeStatus === LikeStatus.Dislike)
          await this.postsRepositorySql.setNoneToDislike(command.postId, queryRunner)
        else if (like.myStatus === LikeStatus.Like && command.newLikeStatus === LikeStatus.None)
          await this.postsRepositorySql.setLikeToNone(command.postId, queryRunner)
        else if (like.myStatus === LikeStatus.Like && command.newLikeStatus === LikeStatus.Dislike)
          await this.postsRepositorySql.setLikeToDislike(command.postId, queryRunner)
        else if (like.myStatus === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.None)
          await this.postsRepositorySql.setDislikeToNone(command.postId, queryRunner)
        else if (like.myStatus === LikeStatus.Dislike && command.newLikeStatus === LikeStatus.Like)
          await this.postsRepositorySql.setDislikeToLike(command.postId, queryRunner)
      }

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