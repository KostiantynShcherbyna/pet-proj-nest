import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { httpStatuses } from "src/httpStatuses"
import { bodyBlogModel } from "src/models/body/bodyBlogModel"
import { bodyPostModel } from "src/models/body/bodyPostModel"
import { queryPostModel } from "src/models/query/queryPostModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { BlogsQueryRepository } from "src/repositories/query/blogsQuery.repository"
import { BlogsModel, Blogs, BlogsDocument } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { myStatusEnum } from "src/utils/constants/constants"
import { errorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { blogView } from "src/views/blogView"
import { postView, postsView } from "src/views/postView"

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
        @Inject(BlogsRepository) protected BlogsRepository: BlogsRepository,
        @Inject(PostsRepository) protected PostsRepository: PostsRepository,
    ) { }



    async createPost(bodyPostModel: bodyPostModel): Promise<Contract<null | postView>> {

        const foundBlog = await this.BlogsRepository.findBlog(bodyPostModel.blogId)
        if (foundBlog === null) return new Contract(null, errorEnums.NOT_FOUND_BLOG)

        const newPost = this.PostsModel.createPost(bodyPostModel, foundBlog.name, this.PostsModel)
        await this.PostsRepository.saveDocument(newPost)

        const newPostView = dtoModify.changePostViewMngs(newPost, myStatusEnum.None)
        return new Contract(newPostView, null)
    }


    async updatePost(body: bodyPostModel, id: string): Promise<Contract<null | boolean>> {

        const post = await this.PostsModel.findById(id)
        if (post === null) return new Contract(null, errorEnums.NOT_FOUND_POST)

        post.updatePost(body)
        await this.PostsRepository.saveDocument(post)

        return new Contract(true, null)
    }

    async deletePost(id: string): Promise<Contract<null | boolean>> {

        const deletedPostResult = await this.PostsModel.deleteOne({ _id: new Types.ObjectId(id) })
        if (deletedPostResult.deletedCount === 0) return new Contract(null, errorEnums.NOT_FOUND_POST)

        return new Contract(true, null)
    }


}

