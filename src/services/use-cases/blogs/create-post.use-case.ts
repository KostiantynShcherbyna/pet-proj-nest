import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyBlogPostModel } from "src/models/body/body-blog-post.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { PostsDocument, PostsModel } from "src/schemas/posts.schema"
import { MyStatus } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { PostView } from "src/views/post.view"


export class CreatePostCommand {
    constructor(public bodyBlogPostModel: BodyBlogPostModel, public blogId: string) { }
}


@CommandHandler(CreatePostCommand)
export class CreatePost implements ICommandHandler<CreatePostCommand> {
    constructor(
        protected blogsRepository: BlogsRepository,
        protected PostsModel: PostsModel,
        protected postsRepository: PostsRepository,
    ) {
    }

    async execute(command: CreatePostCommand): Promise<Contract<null | PostView>> {
        const foundBlog = await this.blogsRepository.findBlog(command.blogId)
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

        const newPost = this.PostsModel.createPost(
            command.bodyBlogPostModel,
            command.blogId,
            foundBlog.name,
            this.PostsModel,
        )
        await this.postsRepository.saveDocument(newPost)

        const newPostView = this.changePostView(newPost, MyStatus.None)
        return new Contract(newPostView, null)
    }


    private changePostView(post: PostsDocument, myStatus: string) {
        const newestLikes = (post: PostsDocument) => post.extendedLikesInfo.newestLikes
            .slice(-3)
            .map(like => {
                return {
                    addedAt: like.addedAt,
                    userId: like.userId,
                    login: like.login
                }
            }).reverse()

        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus: myStatus,
                newestLikes: newestLikes(post),
            },
        }
    }

}