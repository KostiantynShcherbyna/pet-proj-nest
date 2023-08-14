import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { AuthGuard } from "@nestjs/passport"
import { Response } from "express"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { RefreshGuard } from "../../../infrastructure/guards/refresh.guard"
import { LoginBodyInputModel } from "./models/input/login.body.input-model"
import { ConfirmationBodyInputModel } from "./models/input/confirmation.body.input-model"
import { BodyConfirmationResendInputModel } from "./models/input/registration-resend.body.input-model"
import { PasswordRecoveryBodyInputModel } from "./models/input/password-recovery.body.input-model"
import { NewPasswordBodyInputModel } from "./models/input/new-password.body.input-model"
import { UsersQueryRepository } from "../../../repositories/users/mongoose/users.query.repository"
import { DeviceSessionReqInputModel } from "./models/input/device-session.req.input-model"
import { RegistrationBodyInputModel } from "./models/input/registration.body.input-model"
import { ConfirmationCommand } from "../application/use-cases/mongoose/confiramtion.use-case"
import { ConfirmationResendCommand } from "../application/use-cases/mongoose/confiramtion-resend.use-case"
import { StrategyNames, USER_AGENT } from "../../../infrastructure/utils/constants"
import { LoginCommand } from "../application/use-cases/mongoose/login.use-case"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { LogoutCommand } from "../application/use-cases/mongoose/logout.use-case"
import { RefreshTokenCommand } from "../application/use-cases/mongoose/refresh-token.use-case"
import { RegistrationCommand } from "../application/use-cases/mongoose/registration.use-case"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { PasswordRecoveryCommand } from "../application/use-cases/mongoose/password-recovery.use-case"
import { NewPasswordCommand } from "../application/use-cases/mongoose/new-password.use-case"

@Controller("auth")
export class AuthController {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected commandBus: CommandBus
  ) {
  }

  @Post("login")
  // @Throttle(5, 10)
  @UseGuards(AuthGuard(StrategyNames.loginLocalStrategy))
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers("user-agent") userAgent: string = USER_AGENT,
    @Ip() ip: string,
    @Body() bodyAuth: LoginBodyInputModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginContract = await this.commandBus.execute(
      new LoginCommand(
        bodyAuth,
        ip,
        userAgent
      )
    )
    if (loginContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.USER_IS_BANNED) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.PASSWORD_NOT_COMPARED) throw new UnauthorizedException()

    res.cookie("refreshToken", loginContract.data?.refreshToken, { httpOnly: true, secure: true })
    return loginContract.data?.accessJwt
  }


  @UseGuards(RefreshGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel
  ) {
    const logoutContract = await this.commandBus.execute(
      new LogoutCommand(
        deviceSession.deviceId,
        deviceSession.expireAt,
        deviceSession.ip,
        deviceSession.lastActiveDate,
        deviceSession.title,
        deviceSession.userId
      )
    )

    if (logoutContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (logoutContract.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (logoutContract.error === ErrorEnums.DEVICE_NOT_DELETE) throw new UnauthorizedException()
    if (logoutContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new UnauthorizedException()
    return
  }


  @UseGuards(RefreshGuard)
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Headers("user-agent") userAgent: string = USER_AGENT,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenContract = await this.commandBus.execute(
      new RefreshTokenCommand(
        deviceSession,
        ip,
        userAgent
      )
    )

    if (refreshTokenContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (refreshTokenContract.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (refreshTokenContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new UnauthorizedException()

    res.cookie("refreshToken", refreshTokenContract.data?.refreshToken, { httpOnly: true, secure: true })
    return refreshTokenContract.data?.accessJwt
  }


  @Post("registration")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() bodyRegistration: RegistrationBodyInputModel
  ) {
    const registrationContract = await this.commandBus.execute(
      new RegistrationCommand(
        bodyRegistration.login,
        bodyRegistration.email,
        bodyRegistration.password
      )
    )

    if (registrationContract.error === ErrorEnums.USER_EMAIL_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_EXIST, "email")
    )
    if (registrationContract.error === ErrorEnums.USER_LOGIN_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_LOGIN_EXIST, "login")
    )
    if (registrationContract.error === ErrorEnums.USER_NOT_DELETED) throw new InternalServerErrorException() // TODO как обрабатывать логику неотправки емейла ?
    if (registrationContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException() // TODO как обрабатывать логику неотправки емейла ?
    return
  }


  @Post("registration-confirmation")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(
    @Body() bodyConfirmation: ConfirmationBodyInputModel
  ) {
    const confirmationContract = await this.commandBus.execute(
      new ConfirmationCommand(bodyConfirmation.code)
    )

    if (confirmationContract.error === ErrorEnums.USER_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "code")
    )
    if (confirmationContract.error === ErrorEnums.USER_EMAIL_CONFIRMED) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_CONFIRMED, "code")
    )
    if (confirmationContract.error === ErrorEnums.CONFIRMATION_CODE_EXPIRED) throw new BadRequestException(
      callErrorMessage(ErrorEnums.CONFIRMATION_CODE_EXPIRED, "code")
    )
    return
  }


  @Post("registration-email-resending")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationResend(
    @Body() bodyConfirmationResend: BodyConfirmationResendInputModel
  ) {
    const confirmationResendContract = await this.commandBus.execute(
      new ConfirmationResendCommand(bodyConfirmationResend.email)
    )

    if (confirmationResendContract.error === ErrorEnums.USER_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "email")
    )
    if (confirmationResendContract.error === ErrorEnums.USER_EMAIL_CONFIRMED) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_CONFIRMED, "email")
    )
    if (confirmationResendContract.error === ErrorEnums.USER_NOT_DELETED) throw new InternalServerErrorException()
    if (confirmationResendContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException()
    return
  }


  @UseGuards(AccessGuard)
  @Get("me")
  async getMe(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const userView = await this.usersQueryRepository.findUser(deviceSession.userId)
    if (userView === null) throw new UnauthorizedException()
    return userView
  }


  @Post("password-recovery")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() bodyPasswordRecovery: PasswordRecoveryBodyInputModel
  ) {
    const isRecoveryContract = await this.commandBus.execute(
      new PasswordRecoveryCommand(bodyPasswordRecovery.email)
    )
    if (isRecoveryContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException()
    if (isRecoveryContract.error === ErrorEnums.RECOVERY_CODE_NOT_DELETE) throw new InternalServerErrorException()
    return
  }


  @Post("new-password")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() bodyNewPassword: NewPasswordBodyInputModel
  ) {
    const newPasswordContract = await this.commandBus.execute(
      new NewPasswordCommand(
        bodyNewPassword.newPassword,
        bodyNewPassword.recoveryCode
      )
    )

    if (newPasswordContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new BadRequestException(
      callErrorMessage(ErrorEnums.TOKEN_NOT_VERIFY, "recoveryCode")
    )
    if (newPasswordContract.error === ErrorEnums.RECOVERY_CODE_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.RECOVERY_CODE_NOT_FOUND, "recoveryCode")
    )
    if (newPasswordContract.error === ErrorEnums.RECOVERY_CODE_INVALID) throw new BadRequestException(
      callErrorMessage(ErrorEnums.RECOVERY_CODE_INVALID, "recoveryCode")
    )
    if (newPasswordContract.error === ErrorEnums.USER_NOT_FOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.RECOVERY_CODE_INVALID, "recoveryCode")
    )
    return
  }
}
