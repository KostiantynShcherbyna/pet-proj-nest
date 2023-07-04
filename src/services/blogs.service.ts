import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { bodyBlogModel } from "src/models/body/bodyBlogModel"
import { bodyBlogPostModel } from "src/models/body/bodyBlogPostModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { BlogsModel, Blogs, BlogsDocument } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { myStatusEnum } from "src/utils/constants/constants"
import { errorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { blogView } from "src/views/blogView"
import { postView } from "src/views/postView"

@Injectable()
export class BlogsService {
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
        @Inject(BlogsRepository) protected readonly BlogsRepository: BlogsRepository,
        @Inject(PostsRepository) protected PostsRepository: PostsRepository,
    ) { }


    async createBlog(bodyBlogModel: bodyBlogModel): Promise<blogView> {

        const newBlog = this.BlogsModel.createBlog(bodyBlogModel, this.BlogsModel)
        await this.BlogsRepository.saveDocument(newBlog)

        const newBlogView = dtoModify.createBlogViewMngs(newBlog)

        return newBlogView
    }

    async updateBlog(id: string, body: bodyBlogModel): Promise<Contract<null | boolean>> {

        const blog = await this.BlogsModel.findById(id)
        if (blog === null) return new Contract(null, errorEnums.NOT_FOUND_BLOG)

        blog.updateBlog(body)
        await this.BlogsRepository.saveDocument(blog)

        return new Contract(true, null)
    }


    async deleteBlog(id: string): Promise<Contract<null | boolean>> {

        const deletedBlog = await this.BlogsModel.deleteOne({ _id: new Types.ObjectId(id) })
        // const deletedPostsOfDeletedBlog = postsDB.deleteMany({ blogId: id })

        if (deletedBlog.deletedCount === 0) return new Contract(null, errorEnums.NOT_DELETE_BLOG)
        return new Contract(true, null)
    }


    async createPost(bodyBlogPostModel: bodyBlogPostModel, blogId: string): Promise<Contract<null | postView>> {

        const foundBlog = await this.BlogsRepository.findBlog(blogId)
        if (foundBlog === null) return new Contract(null, errorEnums.NOT_FOUND_BLOG)

        const bodyPostModelExt = {
            title: bodyBlogPostModel.title,
            shortDescription: bodyBlogPostModel.shortDescription,
            content: bodyBlogPostModel.content,
            blogId: blogId,
        }

        const newPost = this.PostsModel.createPost(bodyPostModelExt, foundBlog.name, this.PostsModel)
        await this.PostsRepository.saveDocument(newPost)

        const newPostView = dtoModify.changePostViewMngs(newPost, myStatusEnum.None)
        return new Contract(newPostView, null)

    }


}

