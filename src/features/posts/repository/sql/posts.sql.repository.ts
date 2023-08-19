import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Posts, PostsModel } from "../../application/entites/mongoose/posts.schema"
import { Types } from "mongoose"

@Injectable()
export class PostsSqlRepository {
    constructor(
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
    ) { }

    async findPost(postId: string) {

        const foundPost = await this.PostsModel.findById(new Types.ObjectId(postId))
        if (foundPost === null) return null

        return foundPost
    }

    async saveDocument(document: any) {
        await document.save()
    }

}
