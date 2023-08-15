import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { UsersRepository } from "../../../../../repositories/users/mongoose/users.repository"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class ConfirmationCommand {
    constructor(public code: string) { }
}

@CommandHandler(ConfirmationCommand)
export class Confirmation implements ICommandHandler<ConfirmationCommand> {
    constructor(
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(command: ConfirmationCommand): Promise<Contract<null | boolean>> {

        const confirmationCodeDto = ["emailConfirmation.confirmationCode", command.code]
        const user = await this.usersRepository.findUser(confirmationCodeDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
        if (user.checkConfirmation() === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
        if (user.checkExpiration() === false) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

        user.updateUserConfirmation()
        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }


}