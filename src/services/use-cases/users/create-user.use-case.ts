import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { UsersRepository } from "src/repositories/users.repository"
import { Users, UsersDocument, UsersModel } from "src/schemas/users.schema"
import { UserView } from "src/views/user.view"

export class CreateUserCommand {
    constructor(
        public login: string,
        public email: string,
        public password: string,
    ) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUser implements ICommandHandler<CreateUserCommand> {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(command: CreateUserCommand): Promise<UserView> {

        const newUser = await this.UsersModel.createUser(
            {
                login: command.login,
                email: command.email,
                password: command.password,
            },
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