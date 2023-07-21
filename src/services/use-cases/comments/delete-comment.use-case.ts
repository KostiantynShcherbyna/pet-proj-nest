import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { CommentsRepository } from "src/repositories/comments.repository"
import { CommentsModel } from "src/schemas/comments.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class DeleteCommentCommand {
    constructor(public userId: string, public commentId: string) { }
}


@CommandHandler(DeleteCommentCommand)
export class DeleteComment implements ICommandHandler<DeleteCommentCommand>{
    constructor(
        protected CommentsModel: CommentsModel,
        protected commentsRepository: CommentsRepository,
    ) {
    }

    async execute(command: DeleteCommentCommand): Promise<Contract<null | boolean>> {
        // Looking for a comment and check owner
        const comment = await this.commentsRepository.findComment(command.commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        if (comment.commentatorInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT_NOT_DELETED);

        const deleteCommentContract = await this.CommentsModel.deleteComment(command.commentId, this.CommentsModel)
        if (deleteCommentContract.data === 0) return new Contract(null, ErrorEnums.COMMENT_NOT_DELETE);

        return new Contract(true, null);
    }



}