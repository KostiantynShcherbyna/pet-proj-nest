import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Blogs, BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { BlogView } from "src/views/blog.view"


export class CreateBlogCommand {
    constructor(
        public name: string,
        public description: string,
        public websiteUrl: string,
        public userId: string,
    ) { }
}


@CommandHandler(CreateBlogCommand)
export class CreateBlog implements ICommandHandler<CreateBlogCommand>{
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        protected blogsRepository: BlogsRepository,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(command: CreateBlogCommand): Promise<Contract<null | BlogView>> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

        const foundUser = await this.usersRepository.findUser(["id", command.userId])
        if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

        const newBlog = this.BlogsModel.createBlog(
            command,
            foundUser.accountData.login,
            this.BlogsModel
        )
        await this.blogsRepository.saveDocument(newBlog)

        const newBlogView = this.createBlogView(newBlog)

        return new Contract(newBlogView, null)
    }

    private createBlogView(blog: BlogsDocument) {
        const createdBlog = {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: false,
        }

        return createdBlog
    }
}