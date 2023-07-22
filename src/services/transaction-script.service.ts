import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Contract } from "src/contract";
import { BodyPostInputModel } from "src/input-models/body/body-post.input-model";
import { BlogsRepository } from "src/repositories/blogs.repository";
import { PostsRepository } from "src/repositories/posts.repository";
import { Posts, PostsDocument, PostsModel } from "src/schemas/posts.schema";
import { MyStatus } from "src/utils/constants/constants";
import { ErrorEnums } from "src/utils/errors/error-enums";
import { PostView } from "src/views/post.view";

@Injectable()
export class TransactionScriptService {
    constructor(
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
        protected blogsRepository: BlogsRepository,
        protected postsRepository: PostsRepository,
    ) {
    }

    async createPost(bodyPost: BodyPostInputModel): Promise<Contract<null | PostView>> {

        const foundBlog = await this.blogsRepository.findBlog(bodyPost.blogId);
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);

        const newPost = this.PostsModel.createPost(
            bodyPost,
            bodyPost.blogId,
            foundBlog.name,
            this.PostsModel
        );
        await this.postsRepository.saveDocument(newPost);

        const newPostView = this.changePostView(newPost, MyStatus.None);
        return new Contract(newPostView, null);
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