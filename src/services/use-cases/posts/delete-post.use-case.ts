import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/contract"
import { BodyBlogModel } from "src/models/body/body-blog.model"
import { BodyPostModel } from "src/models/body/body-post.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { Blogs, BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { dtoManager } from "src/utils/managers/dto.manager"
import { BlogView } from "src/views/blog.view"

@Injectable()
export class DeletePost {
    constructor(
        protected PostsModel: PostsModel,
    ) {
    }

    async execute(id: string): Promise<Contract<null | boolean>> {

        const deletedPostContract = await this.PostsModel.deletePost(
            id,
            this.PostsModel
        )
        if (deletedPostContract.data === 0)
            return new Contract(null, ErrorEnums.POST_NOT_DELETED);

        return new Contract(true, null);
    }

}