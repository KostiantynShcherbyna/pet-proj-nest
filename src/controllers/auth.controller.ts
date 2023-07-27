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
  Res, UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { AuthGuard } from "@nestjs/passport"
import { Throttle } from "@nestjs/throttler"
import { Response } from "express"
import { DeviceSession } from "src/decorators/device-session.decorator"
import { AccessGuard } from "src/guards/access.guard"
import { RefreshGuard } from "src/guards/refresh.guard"
import { BodyAuthInputModel } from "src/input-models/body/body-auth.input-model"
import { BodyConfirmationInputModel } from "src/input-models/body/body-confirmation.input-model"
import { BodyNewPasswordInputModel } from "src/input-models/body/body-new-password.input-model"
import { BodyPasswordRecoveryInputModel } from "src/input-models/body/body-password-recovery.input-model"
import { BodyConfirmationResendInputModel } from "src/input-models/body/body-registration-resend.input-model"
import { BodyRegistrationInputModel } from "src/input-models/body/body-registration.input-model"
import { DeviceSessionInputModel } from "src/input-models/request/device-session.input-model"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { AuthService } from "src/services/auth.service"
import { ConfirmationResendCommand } from "src/use-cases/auth/confiramtion-resend.use-case"
import { ConfirmationCommand } from "src/use-cases/auth/confiramtion.use-case"
import { LoginCommand } from "src/use-cases/auth/login.use-case"
import { LogoutCommand } from "src/use-cases/auth/logout.use-case"
import { NewPasswordCommand } from "src/use-cases/auth/new-password.use-case"
import { PasswordRecoveryCommand } from "src/use-cases/auth/password-recovery.use-case"
import { RefreshTokenCommand } from "src/use-cases/auth/refresh-token.use-case"
import { RegistrationCommand } from "src/use-cases/auth/registration.use-case"
import { StrategyNames, USER_AGENT } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"

@Controller("auth")
export class AuthController {
  constructor(
    protected authService: AuthService,
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
    @Body() bodyAuth: BodyAuthInputModel,
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
    @DeviceSession() deviceSession: DeviceSessionInputModel
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
    @DeviceSession() deviceSession: DeviceSessionInputModel,
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
    @Body() bodyRegistration: BodyRegistrationInputModel
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
    if (registrationContract.error === ErrorEnums.USER_NOT_DELETE) throw new InternalServerErrorException() // TODO как обрабатывать логику неотправки емейла ?
    if (registrationContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException() // TODO как обрабатывать логику неотправки емейла ?
    return
  }


  @Post("registration-confirmation")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(
    @Body() bodyConfirmation: BodyConfirmationInputModel
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
    if (confirmationResendContract.error === ErrorEnums.USER_NOT_DELETE) throw new InternalServerErrorException()
    if (confirmationResendContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException()
    return
  }


  @UseGuards(AccessGuard)
  @Get("me")
  async getMe(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
  ) {
    const userView = await this.usersQueryRepository.findUser(deviceSession.userId)
    if (userView === null) throw new UnauthorizedException()
    return userView
  }


  @Post("password-recovery")
  // @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() bodyPasswordRecovery: BodyPasswordRecoveryInputModel
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
    @Body() bodyNewPassword: BodyNewPasswordInputModel
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
