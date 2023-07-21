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
export class CreateComment {
    constructor(
        protected postsRepository: PostsRepository,
        protected usersRepository: UsersRepository,
        protected CommentsModel: CommentsModel,
        protected commentsRepository: CommentsRepository,
        protected commentsQueryRepository: CommentsQueryRepository,
    ) {
    }

    async execute({ userId, postId, content }: CommentDto): Promise<Contract<CommentView | null>> {

        const userDto = ["_id", new Types.ObjectId(userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

        const foundPost = await this.postsRepository.findPost(postId)
        if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

        const newComment = this.CommentsModel.createComment(postId, content, user, this.CommentsModel)
        await this.commentsRepository.saveDocument(newComment)

        const foundCommentView = await this.commentsQueryRepository.findComment(newComment.id)
        if (foundCommentView === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

        return new Contract(foundCommentView, null)
    }


}