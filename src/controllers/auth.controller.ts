import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Inject,
  Ip,
  Headers,
  Post,
  HttpStatus,
  Req,
  UseGuards,
  NotFoundException,
  Get, Res, UnauthorizedException, InternalServerErrorException
} from "@nestjs/common"
import { BodyAuthModel } from "src/models/body/body-auth.model"
import { BodyNewPasswordModel } from "src/models/body/body-new-password.model"
import { BodyPasswordRecoveryModel } from "src/models/body/body-password-recovery.model"
import { BodyConfirmationModel } from "src/models/body/body-confirmation.model"
import { BodyRegistrationModel } from "src/models/body/body-registration.model"
import { BodyConfirmationResendModel } from "src/models/body/body-registration-resend.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { RefreshGuard } from "src/guards/refresh.guard"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { AuthService } from "src/services/auth.service"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { Response } from "express"
import { Throttle } from "@nestjs/throttler"
import { StrategyNames, USER_AGENT } from "src/utils/constants/constants"
import { AccessGuard } from "src/guards/access.guard"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { DeviceSessionDecorator } from "src/decorators/device-session.decorator"
import { AuthGuard } from "@nestjs/passport"

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) protected authService: AuthService,
    @Inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository
  ) {
  }

  @Post("login")
  @Throttle(5, 10)
  @UseGuards(AuthGuard(StrategyNames.loginLocalStrategy))
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers("user-agent") userAgent: string | "defaultName",
    @Ip() ip: string,
    @Body() bodyAuth: BodyAuthModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginContract = await this.authService.login(bodyAuth, ip, userAgent)

    if (loginContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED) throw new UnauthorizedException()
    if (loginContract.error === ErrorEnums.PASSWORD_NOT_COMPARED) throw new UnauthorizedException()

    res.cookie("refreshToken", loginContract.data?.refreshToken, { httpOnly: true, secure: true })
    return loginContract.data?.accessJwt
  }


  @UseGuards(RefreshGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel
  ) {
    const logoutContract = await this.authService.logout(deviceSession)

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
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel,
    @Headers("user-agent") userAgent: string = USER_AGENT,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenContract = await this.authService.refreshToken(deviceSession, ip, userAgent)

    if (refreshTokenContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (refreshTokenContract.error === ErrorEnums.DEVICE_NOT_FOUND) throw new UnauthorizedException()
    if (refreshTokenContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new UnauthorizedException()

    res.cookie("refreshToken", refreshTokenContract.data?.refreshToken, { httpOnly: true, secure: true })
    return refreshTokenContract.data?.accessJwt
  }


  @Throttle(5, 10)
  @Post("registration")
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() bodyRegistration: BodyRegistrationModel
  ) {
    const registrationContract = await this.authService.registration(bodyRegistration)

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
  @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(
    @Body() bodyConfirmation: BodyConfirmationModel
  ) {
    const confirmationContract = await this.authService.confirmation(bodyConfirmation.code)

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
  @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationResend(
    @Body() bodyConfirmationResend: BodyConfirmationResendModel
  ) {
    const confirmationResendContract = await this.authService.confirmationResend(bodyConfirmationResend.email)

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
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel,
  ) {
    const userView = await this.usersQueryRepository.findUser(deviceSession.userId)

    if (userView === null) throw new UnauthorizedException()
    return userView
  }


  @Post("password-recovery")
  @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() bodyPasswordRecovery: BodyPasswordRecoveryModel
  ) {
    const isRecoveryContract = await this.authService.passwordRecovery(bodyPasswordRecovery.email)

    if (isRecoveryContract.error === ErrorEnums.EMAIL_NOT_SENT) throw new InternalServerErrorException()
    if (isRecoveryContract.error === ErrorEnums.RECOVERY_CODE_NOT_DELETE) throw new InternalServerErrorException()
    return
  }


  @Post("new-password")
  @Throttle(5, 10)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() bodyNewPassword: BodyNewPasswordModel
  ) {
    const newPasswordContract = await this.authService.newPassword(bodyNewPassword.newPassword, bodyNewPassword.recoveryCode)

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
