import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { UsersRepository } from "src/repositories/users.repository"
import { UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"


@Injectable()
export class DeleteUser {
    constructor(
        protected UsersModel: UsersModel,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(id: string): Promise<Contract<null | boolean>> {

        const deleteUserContract = await this.UsersModel.deleteUser(
            id, this.UsersModel
        )
        if (deleteUserContract.data === 0)
            return new Contract(null, ErrorEnums.USER_NOT_DELETE)

        return new Contract(true, null)
    }

}