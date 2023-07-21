import { CommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { UsersRepository } from "src/repositories/users.repository"
import { UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class DeleteUserCommand {
    constructor(public id: string) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUser {
    constructor(
        protected UsersModel: UsersModel,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(command: DeleteUserCommand): Promise<Contract<null | boolean>> {

        const deleteUserContract = await this.UsersModel.deleteUser(
            command.id, this.UsersModel
        )
        if (deleteUserContract.data === 0)
            return new Contract(null, ErrorEnums.USER_NOT_DELETE)

        return new Contract(true, null)
    }

}