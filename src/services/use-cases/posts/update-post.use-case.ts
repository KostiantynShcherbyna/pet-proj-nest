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
export class UpdatePost {
    constructor(
        protected postsRepository: PostsRepository,
    ) {
    }

    async execute(body: BodyPostModel, id: string): Promise<Contract<null | boolean>> {

        const post = await this.postsRepository.findPost(id);
        if (post === null)
            return new Contract(null, ErrorEnums.POST_NOT_FOUND);

        post.updatePost(body);
        await this.postsRepository.saveDocument(post);

        return new Contract(true, null);
    }


}