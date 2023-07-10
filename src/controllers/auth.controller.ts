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
import { BodyAuthModel } from "src/models/body/BodyAuthModel"
import { BodyNewPasswordModel } from "src/models/body/BodyNewPasswordModel"
import { BodyPasswordRecoveryModel } from "src/models/body/BodyPasswordRecoveryModel"
import { BodyConfirmationModel } from "src/models/body/BodyConfirmationModel"
import { BodyRegistrationModel } from "src/models/body/BodyRegistrationModel"
import { BodyConfirmationResendModel } from "src/models/body/BodyRegistrationResendModel"
import { DeviceSessionModel } from "src/models/request/DeviceSessionModel"
import { RefreshGuard } from "src/refresh.guard"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { AuthService } from "src/services/auth.service"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { Response } from "express"

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) protected authService: AuthService,
    @Inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository
  ) {
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers("user-agent") userAgent: string = "defaultName",
    @Ip() ip: string,
    @Body() bodyAuth: BodyAuthModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokensContract = await this.authService.login(bodyAuth, ip, userAgent)
    if (tokensContract.error === ErrorEnums.NOT_FOUND_USER) throw new UnauthorizedException(Object.values(ErrorEnums.NOT_FOUND_USER))
    if (tokensContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED) throw new UnauthorizedException(Object.values(ErrorEnums.USER_EMAIL_NOT_CONFIRMED))
    if (tokensContract.error === ErrorEnums.PASSWORD_NOT_COMPARED) throw new UnauthorizedException(Object.values(ErrorEnums.PASSWORD_NOT_COMPARED))

    res.cookie("refreshToken", tokensContract.data?.refreshToken)
    return tokensContract.data?.accessJwt
  }


  @UseGuards(RefreshGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() deviceSession: DeviceSessionModel
  ) {
    const tokensContract = await this.authService.logout(deviceSession)
    if (tokensContract.error === ErrorEnums.NOT_FOUND_USER) throw new UnauthorizedException(Object.values(ErrorEnums.NOT_FOUND_USER))
    if (tokensContract.error === ErrorEnums.NOT_DELETE_DEVICE) throw new UnauthorizedException(Object.values(ErrorEnums.NOT_DELETE_DEVICE)) // TODO EXCEPTION
    return
  }

  @UseGuards(RefreshGuard)
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() deviceSession: DeviceSessionModel,
    @Headers("user-agent") userAgent: string,
    @Ip() ip: string,
  ) {
    const tokensContract = await this.authService.refreshToken(deviceSession, ip, userAgent)
    if (tokensContract.error === ErrorEnums.NOT_FOUND_USER) throw new UnauthorizedException(Object.values(ErrorEnums.NOT_FOUND_USER))
    if (tokensContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED) throw new UnauthorizedException(Object.values(ErrorEnums.USER_EMAIL_NOT_CONFIRMED))
    if (tokensContract.error === ErrorEnums.PASSWORD_NOT_COMPARED) throw new UnauthorizedException(Object.values(ErrorEnums.PASSWORD_NOT_COMPARED))
    return tokensContract.data
  }


  @Post("registration")
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() bodyRegistration: BodyRegistrationModel
  ) {
    const tokensContract = await this.authService.registration(bodyRegistration)
    if (tokensContract.error === ErrorEnums.USER_EMAIL_EXIST) throw new BadRequestException(Object.values(ErrorEnums.USER_EMAIL_EXIST))
    if (tokensContract.error === ErrorEnums.USER_LOGIN_EXIST) throw new BadRequestException(Object.values(ErrorEnums.USER_LOGIN_EXIST))
    if (tokensContract.error === ErrorEnums.NOT_DELETE_USER) throw new InternalServerErrorException(Object.values(ErrorEnums.NOT_DELETE_USER))
    if (tokensContract.error === ErrorEnums.NOT_SEND_EMAIL) throw new InternalServerErrorException(Object.values(ErrorEnums.NOT_SEND_EMAIL))
    return
  }


  @Post("registration-confirmation")
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(
    @Body() bodyConfirmation: BodyConfirmationModel
  ) {
    const tokensContract = await this.authService.confirmation(bodyConfirmation.code)
    if (tokensContract.error === ErrorEnums.NOT_FOUND_USER) throw new BadRequestException(Object.values(ErrorEnums.NOT_FOUND_USER))
    if (tokensContract.error === ErrorEnums.USER_EMAIL_CONFIRMED) throw new BadRequestException(Object.values(ErrorEnums.USER_EMAIL_CONFIRMED))
    if (tokensContract.error === ErrorEnums.CONFIRMATION_CODE_EXPIRED) throw new BadRequestException(Object.values(ErrorEnums.CONFIRMATION_CODE_EXPIRED))
    return
  }


  @Post("registration-email-resending")
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationResend(
    @Body() bodyConfirmationResend: BodyConfirmationResendModel
  ) {
    const tokensContract = await this.authService.confirmationResend(bodyConfirmationResend.email)
    if (tokensContract.error === ErrorEnums.NOT_FOUND_USER) throw new BadRequestException()
    if (tokensContract.error === ErrorEnums.USER_EMAIL_CONFIRMED) throw new BadRequestException()
    if (tokensContract.error === ErrorEnums.CONFIRMATION_CODE_EXPIRED) throw new BadRequestException()
    return
  }


  @Get("me")
  async getMe(
    @Req() deviceSession: DeviceSessionModel
  ) {
    const tokensContract = await this.usersQueryRepository.findUser(deviceSession.userId)
    if (tokensContract === null) throw new BadRequestException()
    return
  }


  @Post("password-recovery")
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() bodyPasswordRecovery: BodyPasswordRecoveryModel
  ) {
    const tokensContract = await this.authService.passwordRecovery(bodyPasswordRecovery.email)
    if (tokensContract.error === ErrorEnums.RECOVERY_CODE_NOT_DELETE) throw new InternalServerErrorException()
    if (tokensContract.error === ErrorEnums.NOT_SEND_EMAIL) throw new InternalServerErrorException()
    return
  }


  @Post("new-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() bodyNewPassword: BodyNewPasswordModel
  ) {
    const tokensContract = await this.authService.newPassword(bodyNewPassword.newPassword, bodyNewPassword.recoveryCode)
    if (tokensContract.error === ErrorEnums.TOKEN_NOT_VERIFY) throw new BadRequestException()
    if (tokensContract.error === ErrorEnums.RECOVERY_CODE_NOT_FOUND) throw new BadRequestException()
    if (tokensContract.error === ErrorEnums.RECOVERY_CODE_INVALID) throw new BadRequestException()
    if (tokensContract.error === ErrorEnums.NOT_FOUND_USER) throw new BadRequestException()
    return
  }
}
