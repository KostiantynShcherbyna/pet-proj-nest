import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Contract } from "src/contract";
import { CommentsRepository } from "src/repositories/comments.repository";
import { ErrorEnums } from "src/utils/errors/error-enums";

export class UpdateCommentLikeCommand {
    constructor(
        public userId: string,
        public commentId: string,
        public newLikeStatus: string
    ) { }
}


@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLike implements ICommandHandler<UpdateCommentLikeCommand> {
    constructor(
        protected commentsRepository: CommentsRepository,
    ) {
    }

    async execute(command: UpdateCommentLikeCommand): Promise<Contract<boolean | null>> {

        const comment = await this.commentsRepository.findComment(command.commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        // Create a new Like if there is no Like before or update Like if there is one
        comment.createOrUpdateLike(command.userId, command.newLikeStatus);
        await this.commentsRepository.saveDocument(comment);

        return new Contract(true, null);
    }


}