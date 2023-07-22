import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/contract"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"


export class DeleteBlogCommand {
    constructor(public id: string) { }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlog implements ICommandHandler<DeleteBlogCommand>{
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
    ) {
    }

    async execute(command: DeleteBlogCommand): Promise<Contract<null | boolean>> {

        const deleteBlogContract = await Blogs.deleteBlog(
            command.id,
            this.BlogsModel,
            this.PostsModel
        )
        if (deleteBlogContract.error !== null)
            return new Contract(null, deleteBlogContract.error)

        return new Contract(true, null)
    }
}