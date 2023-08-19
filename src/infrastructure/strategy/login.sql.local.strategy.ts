import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { StrategyNames } from "../utils/constants"
import { UsersRepository } from "../../features/super-admin/infrastructure/mongoose/users.repository"
import { ErrorEnums } from "../utils/error-enums"
import { UsersSqlRepository } from "../../features/super-admin/infrastructure/sql/users.sql.repository"
import { Contract } from "../utils/contract"
import { compareHashManager } from "../services/compare-hash.service"


@Injectable()
export class LoginSqlLocalStrategy extends PassportStrategy(Strategy, StrategyNames.loginSqlLocalStrategy) {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
  ) {
    super({ usernameField: "loginOrEmail" })
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersSqlRepository.findUserByLoginOrEmail({
      login: loginOrEmail,
      email: loginOrEmail
    })
    if (user === null) throw new UnauthorizedException()
    if (user.isConfirmed === false) throw new UnauthorizedException()
    if (await compareHashManager(user.passwordHash, password) === false) throw new UnauthorizedException()

    return user
  }

}