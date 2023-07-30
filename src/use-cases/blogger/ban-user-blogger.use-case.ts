import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/contract"
import { BodyUserBanBloggerInputModel } from "src/input-models/body/body-user-ban-blogger.input-model"
import { BannedBlogUsersRepository } from "src/repositories/banned-blog-users.repository"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { BannedBlogUsers, BannedBlogUsersModel } from "src/schemas/banned-blog-users.schema"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class BanUserBloggerCommand {
    constructor(
        public ownerId: string,
        public bannedUserId: string,
        public bodyUserBan: BodyUserBanBloggerInputModel,
    ) { }
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


        const bannedBlogUserDocument = command.bodyUserBan.isBanned === true
            ? await this.BannedBlogUsersModel.banUser({
                userId: command.bannedUserId,
                banReason: command.bodyUserBan.banReason,
                blogId: command.bodyUserBan.blogId,
                usersRepository: this.usersRepository,
                bannedBlogUsersRepository: this.bannedBlogUsersRepository,
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