import { Contract } from "../../../../infrastructure/utils/contract"
import { BanUserBodyInputModel } from "../../api/models/input/ban-user.body.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Blogs, BlogsModel } from "../entities/mongoose/blogs.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BannedBlogUsers, BannedBlogUsersModel } from "../entities/mongoose/banned-blog-users.schema"
import { BannedBlogUsersRepository } from "../../infrastructure/mongoose/banned-blog-users.repository"
import { BlogsRepository } from "../../../blogs/infrastructure/mongoose/blogs.repository"
import { UsersRepository } from "../../../super-admin/infrastructure/mongoose/users.repository"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"

export class BanUserBloggerCommand {
  constructor(
    public ownerId: string,
    public bannedUserId: string,
    public bodyUserBan: BanUserBodyInputModel,
  ) {
  }
}

@CommandHandler(BanUserBloggerCommand)
export class BanUserBlogger implements ICommandHandler<BanUserBloggerCommand> {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
    protected bannedBlogUsersRepository: BannedBlogUsersRepository,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: BanUserBloggerCommand) {

    const foundBLog = await this.blogsRepository.findBlog(command.bodyUserBan.blogId)
    if (foundBLog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBLog.blogOwnerInfo.userId !== command.ownerId)
      return new Contract(null, ErrorEnums.FOREIGN_BLOG)
    if (foundBLog.banInfo.isBanned === command.bodyUserBan.isBanned)
      return new Contract(true, null)


    const bannedBlogUserDocument = command.bodyUserBan.isBanned === true
      ? await this.BannedBlogUsersModel.banUser({
        userId: command.bannedUserId,
        banReason: command.bodyUserBan.banReason,
        blogId: command.bodyUserBan.blogId,
        usersRepository: this.usersRepository,
        BannedBlogUsersModel: this.BannedBlogUsersModel,
      })
      : await this.BannedBlogUsersModel.unbanUser(
        command.bannedUserId,
        command.bodyUserBan.blogId,
        this.bannedBlogUsersRepository
      )

    if (bannedBlogUserDocument === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    await this.bannedBlogUsersRepository.saveDocument(bannedBlogUserDocument)

    return new Contract(true, null)
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