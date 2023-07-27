import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyBlogPostBloggerInputModel } from "src/input-models/body/body-blog-post-blogger.input-model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class UpdatePostCommand {
    constructor(
        public body: BodyBlogPostBloggerInputModel,
        public blogId: string,
        public postId: string,
        public userId: string,
    ) { }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostBlogger implements ICommandHandler<UpdatePostCommand> {
    constructor(
        protected postsRepository: PostsRepository,
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: UpdatePostCommand): Promise<Contract<null | boolean>> {

        const foundBlog = await this.blogsRepository.findBlog(command.blogId)
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);
        if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG_NOT_UPDATE_POST);

        const post = await this.postsRepository.findPost(command.postId);
        if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND);
        if (post.blogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_POST_NOT_UPDATE_POST);

        const updateDto = {
            title: command.body.title,
            shortDescription: command.body.shortDescription,
            content: command.body.content,
            blogId: command.blogId,
        }

        post.updatePost(updateDto);
        await this.postsRepository.saveDocument(post);

        return new Contract(true, null);
    }


}