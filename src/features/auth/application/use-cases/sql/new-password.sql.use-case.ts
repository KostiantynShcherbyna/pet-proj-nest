import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConfigService, ConfigType } from "@nestjs/config"
import { AuthRepositoryOrm } from "../../../repository/orm/auth-repository.orm"
import { UsersRepositorySql } from "../../../../sa/repository/sql/users.repository.sql"
import { generateHashManager } from "../../../../../infrastructure/services/generate-hash.service"
import { TokensService } from "../../../../../infrastructure/services/tokens.service"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { Secrets } from "../../../../../infrastructure/utils/constants"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class NewPasswordSqlCommand {
  constructor(public newPassword: string, public recoveryCode: string) {
  }
}

@CommandHandler(NewPasswordSqlCommand)
export class NewPasswordSql implements ICommandHandler<NewPasswordSqlCommand> {
  constructor(
    protected tokensService: TokensService,
    protected usersSqlRepository: UsersRepositorySql,
    protected configService: ConfigService<ConfigType<any>, true>,
    protected authSqlRepository: AuthRepositoryOrm,
  ) {
  }

  async execute(command: NewPasswordSqlCommand): Promise<Contract<null | boolean>> {

    const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
    const verifiedEmailDto = await this.tokensService.verifyToken(command.recoveryCode, passwordRecoveryCodeSecret)
    if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const lastRecoveryCodeDto = await this.authSqlRepository.findLastRecoveryCodeByEmail(verifiedEmailDto.email)
    if (lastRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
    if (lastRecoveryCodeDto.recoveryCode !== command.recoveryCode) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)

    const user = await this.usersSqlRepository.findUserByEmail(verifiedEmailDto.email)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const newPasswordHash = await generateHashManager(command.newPassword)
    await this.usersSqlRepository.updatePasswordHash(user.userId, newPasswordHash)

    await this.authSqlRepository.deactivatePasswordRecoveryCode(lastRecoveryCodeDto.recoveryCodeId)

    return new Contract(true, null)
  }


}