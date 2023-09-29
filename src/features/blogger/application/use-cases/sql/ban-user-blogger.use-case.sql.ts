import { Contract } from "../../../../../infrastructure/utils/contract"
import { BanUserBodyInputModel } from "../../../api/models/input/ban-user.body.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { UsersRepositoryOrm } from "../../../../sa/repository/typeorm/users.repository.orm"

export class BanUserBloggerCommandSql {
  constructor(
    public ownerId: string,
    public bannedUserId: string,
    public bodyUserBan: BanUserBodyInputModel,
  ) {
  }
}

@CommandHandler(BanUserBloggerCommandSql)
export class BanUserBloggerSql implements ICommandHandler<BanUserBloggerCommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected usersRepositorySql: UsersRepositoryOrm,
  ) {
  }

  async execute(command: BanUserBloggerCommandSql) {

    const foundBLog = await this.blogsRepositorySql.findBlog(command.bodyUserBan.blogId)
    if (foundBLog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBLog.userId !== command.ownerId)
      return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const userForBan = await this.usersRepositorySql.findUserByUserId(command.bannedUserId)
    if (!userForBan)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const foundBanUsersInfo = await this.blogsRepositorySql.findBanUsersInfo(command.bodyUserBan.blogId, command.bannedUserId)
    if (!foundBanUsersInfo && !command.bodyUserBan.isBanned)
      return new Contract(true, null)
    if (foundBanUsersInfo?.isBanned === command.bodyUserBan.isBanned)
      return new Contract(true, null)


    const banInfoId = command.bodyUserBan.isBanned
      ? await this.blogsRepositorySql.banUserOfBlog({
        blogId: command.bodyUserBan.blogId,
        userId: command.bannedUserId,
        isBanned: true,
        banReason: command.bodyUserBan.banReason,
        banDate: new Date(Date.now()).toISOString()
      })
      : await this.blogsRepositorySql.unbanUserOfBlog({
        blogId: command.bodyUserBan.blogId,
        userId: command.bannedUserId
      })

    return (!banInfoId)
      ? new Contract(null, ErrorEnums.USER_NOT_BANNED)
      : new Contract(true, null)
  }

  // async execute(command: BanUserBloggerCommand) {

  //     const foundBLog = await this.blogsRepository.findBlog(command.bodyUserBan.blogId)
  //     if (foundBLog === null)
  //         return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
  //     if (foundBLog.blogOwnerInfo.userId !== command.ownerId)
  //         return new Contract(null, ErrorEnums.FOREIGN_BLOG)


  //     const foundUser = await this.usersRepository.findUser(["_id", new Types.ObjectId(command.bannedUserId)])
  //     if (foundUser === null)
  //         return new Contract(null, ErrorEnums.USER_NOT_FOUND)

  //     command.bodyUserBan.isBanned === true
  //         ? foundBLog.banUser(command.bannedUserId, foundUser.accountData.login, command.bodyUserBan.banReason)
  //         : foundBLog.unbanUser(command.bannedUserId)

  //     await this.blogsRepository.saveDocument(foundBLog)

  //     return new Contract(true, null)
  // }
}