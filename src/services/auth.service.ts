import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { bodyAuthModel } from "src/models/body/bodyAuthModel"
import { bodyRegistrationModel } from "src/models/body/bodyRegistrationModel"
import { deviceDto } from "src/models/dto/deviceDto"
import { AuthRepository } from "src/repositories/auth.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { RecoveryCodes, RecoveryCodesDocument, RecoveryCodesModel } from "src/schemas/recoveryCode.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { compareHash } from "src/utils/hashFunctions/compareHash"
import { emailManager } from "src/utils/managers/emailManager"
import { tokensView } from "src/views/tokensView"

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
        @Inject(UsersRepository) protected usersRepository: UsersRepository,
        @Inject(DevicesRepository) protected devicesRepository: DevicesRepository,
        @Inject(AuthRepository) protected authRepository: AuthRepository,
    ) { }

    async toLogin(loginBody: bodyAuthModel, deviceIp: string, userAgent: string) {

        const user = await this.usersRepository.findUserLoginOrEmail({ login: loginBody.loginOrEmail, email: loginBody.loginOrEmail })
        if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)
        if (user.checkConfirmation() === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)

        const isPassword = await compareHash(user.accountData.passwordHash, loginBody.password)
        if (isPassword === false) return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)

        const tokens = await this.DevicesModel.createDevice({ deviceIp, userAgent, userId: user._id.toString() })
        await this.devicesRepository.saveDocument(tokens.refreshToken)

        return {
            accessJwt: { accessToken: tokens.accessToken },
            refreshToken: tokens.refreshToken
        }
    }


    async refreshToken(deviceSession: deviceDto, deviceIp: string, userAgent: string): Promise<Contract<null | tokensView>> {

        const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
        if (device === null) return new Contract(null, ErrorEnums.NOT_FOUND_DEVICE)
        //  TODO ANY
        const newTokens: any = device.refreshDevice({ deviceIp, userAgent, userId: user._id.toString() })
        await this.devicesRepository.saveDocument(device)

        const tokensDto = {
            accessJwt: { accessToken: newTokens.accessToken },
            refreshToken: newTokens.refreshToken
        }

        return new Contract(tokensDto, null)
    }


    async toLogout(deviceSession: deviceDto): Promise<Contract<null | boolean>> {

        const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)

        const deleteResult = await this.DevicesModel.deleteOne({ deviceId: deviceSession.deviceId })
        if (deleteResult.deletedCount === 0) return new Contract(null, ErrorEnums.NOT_DELETE_DEVICE)

        return new Contract(true, null)
    }


    async registration(registrationBody: bodyRegistrationModel): Promise<Contract<null | boolean>> {

        const user = await this.usersRepository.findUserLoginOrEmail(registrationBody)
        if (user?.accountData.email === registrationBody.email) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
        if (user?.accountData.login === registrationBody.login) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)

        const newUser = await this.UsersModel.registrationUser(registrationBody, this.UsersModel)
        await this.usersRepository.saveDocument(newUser)
        // SENDING EMAIL ↓↓↓
        const isSend = await emailManager.sendConfirmationCode(newUser)
        if (isSend === false) {

            const deleteResult = await this.UsersModel.deleteOne({ _id: newUser._id })
            if (deleteResult.deletedCount === 0) return new Contract(null, ErrorEnums.NOT_DELETE_USER)

            return new Contract(null, ErrorEnums.NOT_SEND_EMAIL)
        }

        newUser.addSentDate()
        await this.usersRepository.saveDocument(newUser)

        return new Contract(true, null)
    }


    async confirmation(code: string): Promise<Contract<null | boolean>> {

        const confirmationCodeDto = ["emailConfirmation.confirmationCode", code]
        const user = await this.usersRepository.findUser(confirmationCodeDto)
        if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)
        if (user.checkConfirmation() === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
        if (user.checkExpiration() === false) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

        user.updateUserConfirmation()
        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }


    async confirmationResend(email: string) {

        const emailDto = { "accountData.email": email }
        const user = await this.usersRepository.findUser(emailDto)
        if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)
        if (user.checkConfirmation() === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)

        user.updateUserConfirmationCode()
        await this.usersRepository.saveDocument(user)

        // TODO без поиска нового юзера передает юзера со старым ConfirmationCode
        const updatedUser = await this.usersRepository.findUser(emailDto)
        if (updatedUser === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)

        user.addSentDate()
        await this.usersRepository.saveDocument(user)
        // SENDING EMAIL ↓↓↓
        const isSend = await emailManager.sendConfirmationCode(updatedUser)
        if (isSend === false) {

            const deletedCount = await this.UsersModel.deleteOne({ _id: updatedUser._id.toString() })
            if (deletedCount.deletedCount === 0) return new Contract(null, ErrorEnums.NOT_DELETE_USER)

            return new Contract(null, ErrorEnums.NOT_SEND_EMAIL)
        }

        return true
    }


    async passwordRecovery(email: string): Promise<Contract<null | boolean>> {

        const oldRecoveryCode = await this.authRepository.findRecoveryCode(email)

        const newRecoveryCode = oldRecoveryCode === null ?
            this.RecoveryCodesModel.createRecoveryCode(email, this.RecoveryCodesModel) :
            oldRecoveryCode.updateRecoveryCode()

        await this.authRepository.saveDocument(newRecoveryCode)

        // SENDING PASSWORD RECOVERY ↓↓↓
        const isSend = await emailManager.sendPasswordRecovery(email, newRecoveryCode)
        if (isSend === false) {
            const deleteRecoveryCodeCount = await this.RecoveryCodesModel.deleteOne({ email: email })
            if (deleteRecoveryCodeCount.deletedCount === 0) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)

            return new Contract(null, ErrorEnums.NOT_SEND_EMAIL)
        }

        return new Contract(true, null)
    }


    async newPassword(newPassword: string, recoveryCode: string): Promise<Contract<null | boolean>> {

        // const foundedEmailDto = this.jwtServiceMngs.verifyToken(recoveryCode, settings.PASSWORD_RECOVERY_CODE)
        const foundedEmailDto = { email: "kst@gmai.cm" }
        if (foundedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

        const oldRecoveryCodeDto = await this.authRepository.findRecoveryCode(foundedEmailDto.email)
        if (oldRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
        if (oldRecoveryCodeDto.checkRecoveryCode(recoveryCode) === false) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)

        const emailDto = { "accountData.email": foundedEmailDto.email }

        const user = await this.usersRepository.findUser(emailDto)
        if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)

        // const newPasswordHash = await generateHash(newPassword)

        await user.updatePasswordHash(newPassword)
        await this.usersRepository.saveDocument(user)

        // const deleteRecoveryCodeCount = await RecoveryCodes.deleteRecoveryCode(foundedEmailDto.email)
        // if (deleteRecoveryCodeCount === 0) throw new RecoveryCodeNotDeleted()

        return new Contract(true, null)
    }

}

