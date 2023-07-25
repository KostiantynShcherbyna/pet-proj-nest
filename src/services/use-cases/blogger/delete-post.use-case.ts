import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/contract"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class DeletePostCommand {
    constructor(
        public blogId: string,
        public postId: string,
        public userId: string,
    ) { }
}

@CommandHandler(DeletePostCommand)
export class DeletePost implements ICommandHandler<DeletePostCommand> {
    constructor(
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
        protected postsRepository: PostsRepository,
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: DeletePostCommand): Promise<Contract<null | boolean>> {

        const foundBlog = await this.blogsRepository.findBlog(command.blogId)
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);
        if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG_NOT_DELETE_POST);


        // const foundPost = await this.postsRepository.findPost(command.postId)
        // if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND);


        // if (foundPost.blogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_BLOG_NOT_DELETE_POST);

        const deletedPostContract = await this.PostsModel.deletePost(
            command.postId,
            this.PostsModel
        )
        if (deletedPostContract.data === 0)
            return new Contract(null, ErrorEnums.POST_NOT_DELETED);

        return new Contract(true, null);
    }

}