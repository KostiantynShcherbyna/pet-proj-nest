import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { BannedBlogUsersRepository } from "src/repositories/banned-blog-users.repository"
import { CommentsRepository } from "src/repositories/comments.repository"
import { PostsCommentsRepository } from "src/repositories/posts-comments.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { PostsComments, PostsCommentsModel } from "src/schemas/posts-comments.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { CommentView } from "src/views/comment.view"

export class CreateCommentCommand {
    constructor(
        public userId: string,
        public postId: string,
        public content: string,
    ) { }
}

@CommandHandler(CreateCommentCommand)
export class CreateComment implements ICommandHandler<CreateCommentCommand> {
    constructor(
        @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
        @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
        protected postsRepository: PostsRepository,
        protected usersRepository: UsersRepository,
        protected commentsRepository: CommentsRepository,
        protected postsCommentsRepository: PostsCommentsRepository,
        protected commentsQueryRepository: CommentsQueryRepository,
        protected bannedBlogUsersRepository: BannedBlogUsersRepository,
    ) {
    }

    async execute(command: CreateCommentCommand): Promise<Contract<CommentView | null>> {

        const userDto = ["_id", new Types.ObjectId(command.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

        const foundPost = await this.postsRepository.findPost(command.postId)
        if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

        // BANNED USER CANT'T PAST COMMENT
        const bloggerBannedUser = await this.bannedBlogUsersRepository.findBannedBlogUser(command.userId, foundPost.blogId)
        if (bloggerBannedUser !== null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)


        const newComment = this.CommentsModel.createComment(command.postId, command.content, user, this.CommentsModel)
        await this.commentsRepository.saveDocument(newComment)

        const newPostsComment = this.PostsCommentsModel.createPostComment(
            command.postId,
            command.content,
            user,
            this.PostsCommentsModel,
            newComment._id.toString(),
            foundPost.title,
            foundPost.blogId,
            foundPost.blogName
        )

        await this.commentsRepository.saveDocument(newComment)
        await this.postsCommentsRepository.saveDocument(newPostsComment)

        const foundCommentContract = await this.commentsQueryRepository.findComment(newComment.id)
        if (foundCommentContract.error === ErrorEnums.COMMENT_NOT_FOUND) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

        return new Contract(foundCommentContract.data, null)
    }


}