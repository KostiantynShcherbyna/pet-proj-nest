import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Contract } from "src/contract";
import { CommentsRepository } from "src/repositories/comments.repository";
import { UsersRepository } from "src/repositories/users.repository";
import { ErrorEnums } from "src/utils/errors/error-enums";

export class UpdateCommentCommand {
    constructor(
        public userId: string,
        public commentId: string,
        public content: string
    ) { }
}


@CommandHandler(UpdateCommentCommand)
export class UpdateComment implements ICommandHandler<UpdateCommentCommand>{
    constructor(
        protected commentsRepository: CommentsRepository,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(command: UpdateCommentCommand): Promise<Contract<null | boolean>> {
        // Looking for a comment and check owner
        const comment = await this.commentsRepository.findComment(command.commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        if (comment.checkCommentator(command.userId) === false) return new Contract(null, ErrorEnums.FOREIGN_COMMENT);

        comment.updateComment(command.content);
        await this.commentsRepository.saveDocument(comment);

        return new Contract(true, null);
    }


}