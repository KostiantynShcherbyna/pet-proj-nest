import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { PostsRepositoryOrm } from "../../../repository/orm/posts.repository.orm"
import { UsersRepositoryOrm } from "../../../../sa/repository/orm/users.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/orm/blogs.repository.orm"
import { CommentsRepositoryOrm } from "../../../../comments/repository/orm/comments.repository.orm"


export class CreateCommentCommandSql {
  constructor(
    public userId: string,
    public postId: string,
    public content: string,
  ) {
  }
}

@CommandHandler(CreateCommentCommandSql)
export class CreateCommentSql implements ICommandHandler<CreateCommentCommandSql> {
  constructor(
    protected postsRepositorySql: PostsRepositoryOrm,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
    protected commentsRepositoryOrm: CommentsRepositoryOrm,
  ) {
  }

  async execute(command: CreateCommentCommandSql): Promise<Contract<string | null>> {

    const user = await this.usersRepositorySql.findUserByUserId(command.userId)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const foundPost = await this.postsRepositorySql.findPost(command.postId)
    if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const foundBanUsersInfo = await this.blogsRepositorySql.findBanUsersInfo(foundPost.blogId, command.userId)
    if (foundBanUsersInfo?.isBanned === true) return new Contract(null, ErrorEnums.USER_IS_BANNED)

    const newCommentId = await this.commentsRepositoryOrm.createComment(
      {
        postId: command.postId,
        content: command.content,
        date: new Date(Date.now()).toISOString(),
        userId: user.userId,
        userLogin: user.login
      }
    )
    return new Contract(newCommentId, null)
  }


}