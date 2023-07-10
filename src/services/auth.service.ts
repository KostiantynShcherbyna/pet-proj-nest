import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { BodyAuthModel } from "src/models/body/BodyAuthModel"
import { BodyRegistrationModel } from "src/models/body/BodyRegistrationModel"
import { DeviceSessionModel } from "src/models/request/DeviceSessionModel"
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
import { JwtService } from '@nestjs/jwt'
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
    @Inject(TokensService) protected jwtCustomService: TokensService,
    @Inject(JwtService) protected jwtService: JwtService,
  ) { }

  async login(loginBody: BodyAuthModel, deviceIp: string, userAgent: string): Promise<Contract<null | tokensView>> {

    const user = await this.usersRepository.findUserLoginOrEmail({ login: loginBody.loginOrEmail, email: loginBody.loginOrEmail })
    if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)
    if (user.checkConfirmation() === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)

    const isPassword = await compareHash(user.accountData.passwordHash, loginBody.password)
    if (isPassword === false) return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)

    const newTokens = await this.DevicesModel.createDevice({ deviceIp, userAgent, userId: user._id.toString() }, this.jwtService)
    await this.devicesRepository.saveDocument(newTokens.refreshPayload!)

    const tokensDto = {
      accessJwt: { accessToken: newTokens.accessToken },
      refreshToken: newTokens.refreshToken
    }

    return new Contract(tokensDto, null)
  }


  async refreshToken(deviceSession: DeviceSessionModel, deviceIp: string, userAgent: string): Promise<Contract<null | tokensView>> {

    const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)

    const device = await this.devicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.NOT_FOUND_DEVICE)

    const newTokens = await device.refreshDevice({ deviceIp, userAgent, userId: user._id.toString() }, this.jwtService)
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
    if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER)

    const deleteResult = await this.DevicesModel.deleteOne({ deviceId: deviceSession.deviceId })
    if (deleteResult.deletedCount === 0) return new Contract(null, ErrorEnums.NOT_DELETE_DEVICE)

    return new Contract(true, null)
  }


  async registration(registrationBody: BodyRegistrationModel): Promise<Contract<null | boolean>> {

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


  async confirmationResend(email: string): Promise<Contract<null | boolean>> {

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

    return new Contract(true, null)
  }


  async passwordRecovery(email: string): Promise<Contract<null | boolean>> {

    const oldRecoveryCode = await this.authRepository.findRecoveryCode(email)
    //  TODO TS-INGORE
    const newRecoveryCodeDocument = oldRecoveryCode === null
      ? await this.RecoveryCodesModel.createRecoveryCode(email, this.RecoveryCodesModel, this.jwtService)
      : await oldRecoveryCode.updateRecoveryCode(email, this.jwtService)

    await this.authRepository.saveDocument(newRecoveryCodeDocument)

    // SENDING PASSWORD RECOVERY ↓↓↓
    const isSend = await emailManager.sendPasswordRecovery(email, newRecoveryCodeDocument)
    if (isSend === false) {
      const deleteRecoveryCodeCount = await this.RecoveryCodesModel.deleteOne({ email: email })
      if (deleteRecoveryCodeCount.deletedCount === 0) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)

      return new Contract(null, ErrorEnums.NOT_SEND_EMAIL)
    }

    return new Contract(true, null)
  }


  async newPassword(newPassword: string, recoveryCode: string): Promise<Contract<null | boolean>> {

    // const foundedEmailDto = this.jwtServiceMngs.verifyToken(recoveryCode, settings.PASSWORD_RECOVERY_CODE)
    // const foundedEmailDto = await this.jwtService.verifyAsync(recoveryCode)
    const verifiedEmailDto = await this.jwtCustomService.verifyToken(recoveryCode, settings.PASSWORD_RECOVERY_CODE)
    if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const oldRecoveryCodeDto = await this.authRepository.findRecoveryCode(verifiedEmailDto.email)
    if (oldRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
    if (oldRecoveryCodeDto.checkRecoveryCode(recoveryCode) === false) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)

    const emailDto = { "accountData.email": verifiedEmailDto.email }

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

