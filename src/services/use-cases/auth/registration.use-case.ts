import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyRegistrationModel } from "src/models/body/body-registration.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { UsersRepository } from "src/repositories/users.repository"
import { UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { emailAdapter } from "src/utils/managers/email.adapter"

export class RegistrationCommand {
    constructor(public registrationBody: BodyRegistrationModel) { }
}

@CommandHandler(RegistrationCommand)
export class Registration implements ICommandHandler<RegistrationCommand> {
    constructor(
        protected usersRepository: UsersRepository,
        protected UsersModel: UsersModel,
    ) {
    }


    async execute(comamnd: RegistrationCommand): Promise<Contract<null | boolean>> {

        const user = await this.usersRepository.findUserLoginOrEmail(comamnd.registrationBody)
        const checkEmailAndLoginContract = user?.checkEmailAndLogin(
            {
                email: user?.accountData.email,
                login: user?.accountData.login,
                inputEmail: comamnd.registrationBody.email,
                inputLogin: comamnd.registrationBody.login
            }
        )
        if (checkEmailAndLoginContract?.error === ErrorEnums.USER_EMAIL_EXIST)
            return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
        if (checkEmailAndLoginContract?.error === ErrorEnums.USER_LOGIN_EXIST)
            return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)


        const newUser = await this.UsersModel.registrationUser(comamnd.registrationBody, this.UsersModel)
        await this.usersRepository.saveDocument(newUser)

        // SENDING EMAIL ↓↓↓ TODO TO CLASS
        const isSend = await emailAdapter.sendConfirmationCode(newUser)
        if (isSend === false) {
            const deletedUserContract = await this.UsersModel.deleteUser(newUser._id.toString(), this.UsersModel)
            if (deletedUserContract.data === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETE)

            return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
        }


        newUser.addSentDate()
        await this.usersRepository.saveDocument(newUser)

        return new Contract(true, null)
    }


}