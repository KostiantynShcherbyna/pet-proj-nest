import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
    ) { }

    async findPost(postId: string) {

        const foundPost = await this.PostsModel.findOne({ _id: new Types.ObjectId(postId) })
        if (foundPost === null) return null

        return foundPost
    }

    async saveDocument(document: any) {
        await document.save()
    }

}
