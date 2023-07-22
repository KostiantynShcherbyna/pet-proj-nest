import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/contract"
import { BodyUserInputModel } from "src/input-models/body/body-user.input-model"
import { UsersRepository } from "src/repositories/users.repository"
import { Users, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { dtoManager } from "src/utils/managers/dto.manager"
import { UserView } from "src/views/user.view"

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @Inject(UsersRepository) protected usersRepository: UsersRepository,
    ) { }


    async createUser(newUserData: BodyUserInputModel): Promise<UserView> {

        const newUser = await this.UsersModel.createUser(newUserData, this.UsersModel)
        await this.usersRepository.saveDocument(newUser)
        const userView = dtoManager.createUserView(newUser)
        return userView
    }


    async deleteUser(id: string): Promise<Contract<null | boolean>> {

        const deleteUserContract = await this.UsersModel.deleteUser(id, this.UsersModel)
        if (deleteUserContract.data === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETE)

        return new Contract(true, null)
    }

}

