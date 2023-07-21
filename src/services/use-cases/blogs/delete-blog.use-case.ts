import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { PostsModel } from "src/schemas/posts.schema"


export class DeleteBlogCommand {
    constructor(public id: string) { }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlog implements ICommandHandler<DeleteBlogCommand>{
    constructor(
        protected BlogsModel: BlogsModel,
        protected PostsModel: PostsModel,

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