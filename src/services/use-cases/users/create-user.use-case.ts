import { Injectable } from "@nestjs/common"
import { BodyUserModel } from "src/models/body/body-user.model"
import { UsersRepository } from "src/repositories/users.repository"
import { UsersDocument, UsersModel } from "src/schemas/users.schema"
import { UserView } from "src/views/user.view"

@Injectable()
export class CreateUser {
    constructor(
        protected UsersModel: UsersModel,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(newUserData: BodyUserModel): Promise<UserView> {

        const newUser = await this.UsersModel.createUser(
            newUserData,
            this.UsersModel
        )
        await this.usersRepository.saveDocument(newUser)
        
        const userView = this.createUserView(newUser)
        return userView
    }

    private createUserView(data: UsersDocument) {
        return {
            id: data._id.toString(),
            login: data.accountData.login,
            email: data.accountData.email,
            createdAt: data.accountData.createdAt,
        }
    }

}