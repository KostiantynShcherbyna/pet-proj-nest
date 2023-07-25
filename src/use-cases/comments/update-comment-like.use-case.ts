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
    usersRepository: any;
    constructor(
        protected commentsRepository: CommentsRepository,
    ) {
    }

    async execute(command: UpdateCommentLikeCommand): Promise<Contract<boolean | null>> {

        const foundUser = await this.usersRepository.findUser(command.userId)
        if (foundUser === null)
          return new Contract(null, ErrorEnums.USER_NOT_FOUND)
        if (foundUser.accountData.banInfo.isBanned === true)
          return new Contract(null, ErrorEnums.USER_IS_BANNED)

        const comment = await this.commentsRepository.findComment(command.commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);

      
        // Create a new Like if there is no Like before or update Like if there is one
        comment.createOrUpdateLike(command.userId, command.newLikeStatus);
        await this.commentsRepository.saveDocument(comment);

        return new Contract(true, null);
    }


}