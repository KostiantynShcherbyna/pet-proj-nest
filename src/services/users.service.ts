import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { BodyUserModel } from "src/models/body/BodyUserModel"
import { UsersRepository } from "src/repositories/users.repository"
import { Users, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { UserView } from "src/views/UserView"

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @Inject(UsersRepository) protected usersRepository: UsersRepository,
    ) { }


    async createUser(newUserData: BodyUserModel): Promise<UserView> {

        const newUser = await this.UsersModel.createUser(newUserData, this.UsersModel)
        await this.usersRepository.saveDocument(newUser)
        const userView = dtoModify.createUserView(newUser)
        return userView
    }


    async deleteUser(id: string): Promise<Contract<null | boolean>> {

        const deleteResult = await this.UsersModel.deleteOne({ _id: new Types.ObjectId(id) })
        if (deleteResult.deletedCount === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETE)

        return new Contract(true, null)
    }

}

