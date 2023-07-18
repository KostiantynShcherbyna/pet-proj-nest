import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contract"
import { BodyAuthModel } from "src/models/body/body-auth.model"
import { BodyRegistrationModel } from "src/models/body/body-registration.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { AuthRepository } from "src/repositories/auth.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { RecoveryCodes, RecoveryCodesDocument, RecoveryCodesModel } from "src/schemas/recoveryCode.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { compareHashManager } from "src/utils/managers/compare-hash.manager"
import { emailAdapter } from "src/utils/managers/email.adapter"
import { TokensView } from "src/views/TokensView"
import { JwtService } from "@nestjs/jwt"
import { TokensService } from "./tokens.service"
import { settings } from "src/settings"

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(DevicesRepository) protected devicesRepository: DevicesRepository,
    @Inject(AuthRepository) protected authRepository: AuthRepository,
    @Inject(TokensService) protected tokensService: TokensService,
  ) {
  }


  async login(loginBody: BodyAuthModel, deviceIp: string, userAgent: string): Promise<Contract<null | TokensView>> {

    const user = await this.usersRepository.findUserLoginOrEmail({
      login: loginBody.loginOrEmail,
      email: loginBody.loginOrEmail
    })
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)


    const checkConfirmationAndHashContract = await user
      .checkConfirmationAndHash(
        user.accountData.passwordHash,
        loginBody.password
      )
    if (checkConfirmationAndHashContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
      return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
    if (checkConfirmationAndHashContract.error === ErrorEnums.PASSWORD_NOT_COMPARED)
      return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)


    const newTokens = await this.DevicesModel
      .createDevice(
        { deviceIp, userAgent, userId: user._id.toString() },
        this.DevicesModel
      )
    await this.devicesRepository.saveDocument(newTokens.refreshEntry)


    const tokensDto = {
      accessJwt: { accessToken: newTokens.accessToken },
      refreshToken: newTokens.refreshToken
    }
    return new Contract(tokensDto, null)
  }



  async refreshToken(deviceSession: DeviceSessionModel, deviceIp: string, userAgent: string): Promise<Contract<null | TokensView>> {

    const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)


    const device = await this.devicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (deviceSession.lastActiveDate < device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


    const newTokens = await device.refreshDevice({ deviceIp, userAgent, device })
    await this.devicesRepository.saveDocument(device)


    const tokensDto = {
      accessJwt: { accessToken: newTokens.accessToken },
      refreshToken: newTokens.refreshToken
    }
    return new Contract(tokensDto, null)
  }


  async logout(deviceSession: DeviceSessionModel): Promise<Contract<null | boolean>> {

    const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)


    const device = await this.devicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (deviceSession.lastActiveDate < device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


    const deleteResult = await this.DevicesModel.deleteOne({ deviceId: deviceSession.deviceId })
    if (deleteResult.deletedCount === 0)
      return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


  async registration(registrationBody: BodyRegistrationModel): Promise<Contract<null | boolean>> {

    const user = await this.usersRepository.findUserLoginOrEmail(registrationBody)
    const checkEmailAndLoginContract = user?.checkEmailAndLogin(
      {
        email: user?.accountData.email,
        login: user?.accountData.login,
        inputEmail: registrationBody.email,
        inputLogin: registrationBody.login
      }
    )
    if (checkEmailAndLoginContract?.error === ErrorEnums.USER_EMAIL_EXIST)
      return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (checkEmailAndLoginContract?.error === ErrorEnums.USER_LOGIN_EXIST)
      return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)


    const newUser = await this.UsersModel.registrationUser(registrationBody, this.UsersModel)
    await this.usersRepository.saveDocument(newUser)

    // SENDING EMAIL ↓↓↓
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


  async confirmation(code: string): Promise<Contract<null | boolean>> {

    const confirmationCodeDto = ["emailConfirmation.confirmationCode", code]
    const user = await this.usersRepository.findUser(confirmationCodeDto)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.checkConfirmation() === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
    if (user.checkExpiration() === false) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    user.updateUserConfirmation()
    await this.usersRepository.saveDocument(user)

    return new Contract(true, null)
  }


  async confirmationResend(email: string): Promise<Contract<null | boolean>> {

    const emailDto = ["accountData.email", email]
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


  async passwordRecovery(email: string): Promise<Contract<null | boolean>> {

    const oldRecoveryCode = await this.authRepository.findRecoveryCode(email)

    //  TODO ANY
    const newRecoveryCodeDocument = oldRecoveryCode === null
      ? await this.RecoveryCodesModel.newPasswordRecovery(email, this.RecoveryCodesModel, this.tokensService)
      : await oldRecoveryCode.updatePasswordRecovery(email, this.tokensService)
    await this.authRepository.saveDocument(newRecoveryCodeDocument)

    // SENDING PASSWORD RECOVERY ↓↓↓
    const isSend = await emailAdapter.sendPasswordRecovery(newRecoveryCodeDocument.email, newRecoveryCodeDocument.recoveryCode)
    if (isSend === false) {
      const deletedResult = await this.RecoveryCodesModel.deleteOne({ email: email })
      if (deletedResult.deletedCount === 0) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)
      return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    }

    return new Contract(true, null)
  }


  async newPassword(newPassword: string, recoveryCode: string): Promise<Contract<null | boolean>> {

    const verifiedEmailDto = await this.tokensService.verifyToken(recoveryCode, settings.PASSWORD_RECOVERY_CODE)
    if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


    const oldRecoveryCodeDto = await this.authRepository.findRecoveryCode(verifiedEmailDto.email)
    if (oldRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
    if (oldRecoveryCodeDto.checkRecoveryCode(recoveryCode) === false) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)


    const emailDto = { "accountData.email": verifiedEmailDto.email }
    const user = await this.usersRepository.findUser(emailDto)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    
    await user.updatePasswordHash(newPassword)
    await this.usersRepository.saveDocument(user)

    return new Contract(true, null)
  }

}

