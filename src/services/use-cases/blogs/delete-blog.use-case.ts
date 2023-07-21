import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { PostsModel } from "src/schemas/posts.schema"


@Injectable()
export class DeleteBlog {
    constructor(
        protected BlogsModel: BlogsModel,
        protected PostsModel: PostsModel,

    ) {
    }

    async execute(id: string): Promise<Contract<null | boolean>> {

        const deleteBlogContract = await Blogs.deleteBlog(
            id,
            this.BlogsModel,
            this.PostsModel
        )
        if (deleteBlogContract.error !== null)
            return new Contract(null, deleteBlogContract.error)

        return new Contract(true, null)
    }
}