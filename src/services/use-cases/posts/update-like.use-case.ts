import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { CommentDto } from "src/dto/comment.dto"
import { BodyBlogModel } from "src/models/body/body-blog.model"
import { BodyPostModel } from "src/models/body/body-post.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { CommentsRepository } from "src/repositories/comments.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Blogs, BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"
import { CommentsModel } from "src/schemas/comments.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { dtoManager } from "src/utils/managers/dto.manager"
import { BlogView } from "src/views/blog.view"
import { CommentView } from "src/views/comment.view"

@Injectable()
export class UpdateLike {
    constructor(
        protected postsRepository: PostsRepository,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(userId: string, postId: string, newLikeStatus: string) {
        const post = await this.postsRepository.findPost(postId);
        if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND);

        const userDto = ["_id", new Types.ObjectId(userId)];
        const user = await this.usersRepository.findUser(userDto);
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND);

        // Create a new Like if there is no Like before or update Like if there is one
        post.createOrUpdateLike(user, newLikeStatus);
        await this.postsRepository.saveDocument(post);

        return new Contract(true, null);
    }


}