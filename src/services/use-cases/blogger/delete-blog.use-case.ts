import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/contract"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"


export class DeleteBlogCommand {
    constructor(
        public blogId: string,
        public userId: string
    ) { }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlog implements ICommandHandler<DeleteBlogCommand>{
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: DeleteBlogCommand): Promise<Contract<null | boolean>> {

        const foundBlog = await this.blogsRepository.findBlog(command.blogId)
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);
        if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG_NOT_DELETE);

        const deleteBlogContract = await Blogs.deleteBlog(
            command.blogId,
            this.BlogsModel,
            this.PostsModel
        )
        if (deleteBlogContract.error !== null)
            return new Contract(null, deleteBlogContract.error)

        return new Contract(true, null)
    }
}