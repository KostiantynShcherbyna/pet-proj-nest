import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Contract } from "src/contract";
import { BodyPostModel } from "src/models/body/body-post.model";
import { BlogsRepository } from "src/repositories/blogs.repository";
import { PostsRepository } from "src/repositories/posts.repository";
import { Posts, PostsDocument, PostsModel } from "src/schemas/posts.schema";
import { MyStatus } from "src/utils/constants/constants";
import { ErrorEnums } from "src/utils/errors/error-enums";
import { dtoManager } from "src/utils/managers/dto.manager";
import { PostView } from "src/views/post.view";
import { UsersRepository } from "../repositories/users.repository";
import { Comments, CommentsModel } from "src/schemas/comments.schema";
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository";
import { CommentView } from "src/views/comment.view";
import { CommentsRepository } from "src/repositories/comments.repository";
import { CommentDto } from "src/dto/comment.dto";

@Injectable()
export class TransactionScriptService {
    constructor(
        protected PostsModel: PostsModel,
        protected blogsRepository: BlogsRepository,
        protected postsRepository: PostsRepository,
    ) {
    }

    async createPost(bodyPost: BodyPostModel): Promise<Contract<null | PostView>> {

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