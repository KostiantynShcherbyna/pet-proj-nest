import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { bodyPostModel } from "src/models/body/bodyPostModel"
import { bodyUserModel } from "src/models/body/bodyUserModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { myStatusEnum } from "src/utils/constants/constants"
import { errorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { blogView } from "src/views/blogView"
import { postView, postsView } from "src/views/postView"
import { userView } from "src/views/userView"

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @Inject(UsersRepository) protected UsersRepository: UsersRepository,
    ) { }


    async createUser(newUserData: bodyUserModel): Promise<userView> {

        const newUser = await this.UsersModel.createUser(newUserData, this.UsersModel)
        await this.UsersRepository.saveDocument(newUser)

        const userView = dtoModify.createUserView(newUser)
        return userView
    }


    async deleteUser(id: string): Promise<Contract<null | boolean>> {

        const deleteResult = await this.UsersModel.deleteOne({ _id: new Types.ObjectId(id) })
        if (deleteResult.deletedCount === 0) return new Contract(null, errorEnums.NOT_DELETE_USER)

        return new Contract(true, null)
    }

}

