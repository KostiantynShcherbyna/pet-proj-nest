import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { Blogs, BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"
import { BlogView } from "src/views/blog.view"


export class CreateBlogCommand {
    constructor(public name: string, public description: string, public websiteUrl: string) { }
}


@CommandHandler(CreateBlogCommand)
export class CreateBlog implements ICommandHandler<CreateBlogCommand>{
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: CreateBlogCommand): Promise<BlogView> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)
        const newBlog = this.BlogsModel.createBlog(
            {
                name: command.name,
                description: command.description,
                websiteUrl: command.websiteUrl,
            },
            this.BlogsModel
        )
        await this.blogsRepository.saveDocument(newBlog)

        const newBlogView = this.createBlogView(newBlog)

        return newBlogView
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