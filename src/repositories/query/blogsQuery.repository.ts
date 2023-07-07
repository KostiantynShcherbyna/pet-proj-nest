import { Injectable, Inject } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogModel } from "src/models/query/QueryBlogModel"
import { blogView, blogsView } from "src/views/blogView"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { dtoModify } from "src/utils/modify/dtoModify"
import { Types } from "mongoose"
import { QueryPostModel } from "src/models/query/QueryPostModel"
import { postsView } from "src/views/postView"
import { Posts, PostsModel } from "src/schemas/posts.schema"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class BlogsQueryRepository {
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        @Inject(BlogsRepository) protected blogsRepositoryMngs: BlogsRepository
    ) { }


    async findBlogView(id: string): Promise<null | blogView> {
        const foundBlog = await this.BlogsModel.findOne({ _id: new Types.ObjectId(id) })
        if (foundBlog === null) return null

        const foundedBlogView = dtoModify.changeBlogView(foundBlog)
        return foundedBlogView
    }


    async findBlogsView(query: QueryBlogModel): Promise<blogsView> {

        const PAGE_SIZE_DEFAULT = 10
        const PAGE_NUMBER_DEFAULT = 1
        const SEARCH_NAME_TERM_DEFAULT = ''
        const SORT_BY_DEFAULT = 'createdAt'
        const SORT_DIRECTION_DEFAULT = -1

        const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
        const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
        const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
        const sortBy = query.sortBy || SORT_BY_DEFAULT
        const sortDirection = query.sortDirection === "asc" ? 1 : SORT_DIRECTION_DEFAULT

        const skippedBlogsCount = (pageNumber - 1) * pageSize

        const totalCount = await this.BlogsModel.countDocuments({ name: { $regex: searchNameTerm, $options: 'ix' } })

        const pagesCount = Math.ceil(totalCount / pageSize)


        const requestedBlogs = await this.BlogsModel
            .find({ name: { $regex: searchNameTerm, $options: 'ix' } })
            .sort({ [sortBy]: sortDirection })
            .limit(pageSize)
            .skip(skippedBlogsCount)
            .lean()


        const mappedBlogs = dtoModify.changeBlogsView(requestedBlogs)

        const blogsView = {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: mappedBlogs
        }

        return blogsView
    }

}