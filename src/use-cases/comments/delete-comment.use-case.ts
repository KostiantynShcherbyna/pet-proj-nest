import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { CommentsRepository } from "src/repositories/comments.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class DeleteCommentCommand {
    constructor(
        public userId: string,
        public commentId: string
    ) { }
}


@CommandHandler(DeleteCommentCommand)
export class DeleteComment implements ICommandHandler<DeleteCommentCommand>{
    constructor(
        @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
        protected commentsRepository: CommentsRepository,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(command: DeleteCommentCommand): Promise<Contract<null | boolean>> {
        // Looking for a comment and check owner
        // const foundUser = await this.usersRepository.findUser(["_id", new Types.ObjectId(command.userId)])
        // if (foundUser === null)
        //   return new Contract(null, ErrorEnums.USER_NOT_FOUND)
        // if (foundUser.accountData.banInfo.isBanned === true)
        //   return new Contract(null, ErrorEnums.USER_IS_BANNED)


        const comment = await this.commentsRepository.findComment(command.commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        if (comment.commentatorInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT_NOT_DELETED);


        const deleteCommentContract = await Comments.deleteComment(command.commentId, this.CommentsModel)
        if (deleteCommentContract.data === 0) return new Contract(null, ErrorEnums.COMMENT_NOT_DELETE);

        return new Contract(true, null);
    }



}