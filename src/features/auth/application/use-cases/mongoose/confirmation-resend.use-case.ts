import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Users, UsersModel } from "../../../../sa/application/entities/mongoose/users.schema"
import { UsersRepository } from "../../../../sa/repository/mongoose/users.repository"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class ConfirmationResendCommand {
    constructor(public email: string) { }
}

@CommandHandler(ConfirmationResendCommand)
export class ConfirmationResend implements ICommandHandler<ConfirmationResendCommand> {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        protected usersRepository: UsersRepository,
        protected emailAdapter: EmailAdapter,
    ) {
    }

    async execute(command: ConfirmationResendCommand): Promise<Contract<null | boolean>> {

        const emailDto = ["accountData.email", command.email]
        const user = await this.usersRepository.findUser(emailDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
        if (user.checkConfirmation() === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)


        user.updateUserConfirmationCode()
        await this.usersRepository.saveDocument(user)


        user.addSentDate()
        await this.usersRepository.saveDocument(user)

        // SENDING EMAIL ↓↓↓
        const isSend = await this.emailAdapter.sendConfirmationCode(user)
        if (isSend === false) {
            const deletedResult = await this.UsersModel.deleteOne({ _id: user._id })
            if (deletedResult.deletedCount === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETED)

            return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
        }

        return new Contract(true, null)
    }


}