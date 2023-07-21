import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { PostsModel } from "src/schemas/posts.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class DeletePostCommand {
    constructor(public id: string) { }
}

@CommandHandler(DeletePostCommand)
export class DeletePost implements ICommandHandler<DeletePostCommand> {
    constructor(
        protected PostsModel: PostsModel,
    ) {
    }

    async execute(command: DeletePostCommand): Promise<Contract<null | boolean>> {

        const deletedPostContract = await this.PostsModel.deletePost(
            command.id,
            this.PostsModel
        )
        if (deletedPostContract.data === 0)
            return new Contract(null, ErrorEnums.POST_NOT_DELETED);

        return new Contract(true, null);
    }

}