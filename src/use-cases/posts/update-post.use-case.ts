import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/contract"
import { BodyPostInputModel } from "src/input-models/body/body-post.input-model"
import { PostsCommentsRepository } from "src/repositories/posts-comments.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { PostsComments, PostsCommentsModel } from "src/schemas/posts-comments.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class UpdatePostCommand {
    constructor(
        public body: BodyPostInputModel,
        public id: string
    ) { }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePost implements ICommandHandler<UpdatePostCommand> {
    constructor(
        @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
        protected postsRepository: PostsRepository,
        protected postsCommentsRepository: PostsCommentsRepository,
    ) {
    }

    async execute(command: UpdatePostCommand): Promise<Contract<null | boolean>> {

        const post = await this.postsRepository.findPost(command.id);
        if (post === null)
            return new Contract(null, ErrorEnums.POST_NOT_FOUND);


        // const postComments = await this.postsCommentsRepository.findPostComments(["postInfo.id", command.id]);
        // if (postComments === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);


        post.updatePost(command.body);
        await this.postsRepository.saveDocument(post);

        const updatePostCommentsResult = await this.PostsCommentsModel.updatePostComments(
            post._id.toString(),
            this.PostsCommentsModel
        )
        if (updatePostCommentsResult === 0)
            return new Contract(null, ErrorEnums.POST_NOT_FOUND);


        return new Contract(true, null);
    }


}