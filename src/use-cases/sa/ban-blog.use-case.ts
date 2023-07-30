import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/contract"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class BanBlogCommand {
    constructor(
        public blogId: string,
        public isBanned: boolean,
    ) { }
}

@CommandHandler(BanBlogCommand)
export class BanBlog implements ICommandHandler<BanBlogCommand> {
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        protected blogsRepository: BlogsRepository,
        // @InjectModel(Users.name) protected UsersModel: UsersModel,
        // @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        // protected usersRepository: UsersRepository,
        // protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(command: BanBlogCommand) {

        const foundBlog = await this.blogsRepository.findBlog(command.blogId)
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);

        command.isBanned === true
            ? foundBlog.banBlog()
            : foundBlog.unbanBlog()

        return new Contract(true, null);
    }
}