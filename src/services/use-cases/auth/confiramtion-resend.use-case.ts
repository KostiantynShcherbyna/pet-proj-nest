import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { UsersRepository } from "src/repositories/users.repository"
import { UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { emailAdapter } from "src/utils/managers/email.adapter"

export class ConfirmationResendCommand {
    constructor(public email: string) { }
}

@CommandHandler(ConfirmationResendCommand)
export class ConfirmationResend implements ICommandHandler<ConfirmationResendCommand> {
    constructor(
        protected usersRepository: UsersRepository,
        protected UsersModel: UsersModel,
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
        const isSend = await emailAdapter.sendConfirmationCode(user)
        if (isSend === false) {
            const deletedResult = await this.UsersModel.deleteOne({ _id: user._id })
            if (deletedResult.deletedCount === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETE)

            return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
        }

        return new Contract(true, null)
    }


}