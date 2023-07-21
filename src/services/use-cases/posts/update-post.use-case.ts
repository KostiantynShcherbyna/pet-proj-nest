import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyPostModel } from "src/models/body/body-post.model"
import { PostsRepository } from "src/repositories/posts.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class UpdatePostCommand {
    constructor(public body: BodyPostModel, public id: string) { }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePost implements ICommandHandler<UpdatePostCommand> {
    constructor(
        protected postsRepository: PostsRepository,
    ) {
    }

    async execute(command: UpdatePostCommand): Promise<Contract<null | boolean>> {

        const post = await this.postsRepository.findPost(command.id);
        if (post === null)
            return new Contract(null, ErrorEnums.POST_NOT_FOUND);

        post.updatePost(command.body);
        await this.postsRepository.saveDocument(post);

        return new Contract(true, null);
    }


}