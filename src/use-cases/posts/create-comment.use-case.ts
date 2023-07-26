import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { CommentsRepository } from "src/repositories/comments.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
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
        protected postsRepository: PostsRepository,
        protected usersRepository: UsersRepository,
        protected commentsRepository: CommentsRepository,
        protected commentsQueryRepository: CommentsQueryRepository,
    ) {
    }

    async execute(command: CreateCommentCommand): Promise<Contract<CommentView | null>> {

        const userDto = ["_id", new Types.ObjectId(command.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

        const foundPost = await this.postsRepository.findPost(command.postId)
        if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

        const newComment = this.CommentsModel.createComment(command.postId, command.content, user, this.CommentsModel)
        await this.commentsRepository.saveDocument(newComment)

        const foundCommentContract = await this.commentsQueryRepository.findComment(newComment.id)
        if (foundCommentContract.error === ErrorEnums.COMMENT_NOT_FOUND) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

        return new Contract(foundCommentContract.data, null)
    }


}