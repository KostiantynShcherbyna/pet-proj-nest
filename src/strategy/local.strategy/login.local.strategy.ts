import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from 'src/repositories/users.repository';
import { ErrorEnums } from 'src/utils/errors/error-enums';
import { callErrorMessage } from 'src/utils/managers/error-message.manager';
import { StrategyNames } from 'src/utils/constants/constants';

@Injectable()
export class LoginLocalStrategy extends PassportStrategy(Strategy, StrategyNames.loginLocalStrategy) {
    constructor(
        protected usersRepository: UsersRepository,
    ) {
        super({ usernameField: "loginOrEmail" });
    }

    async validate(loginOrEmail: string, password: string): Promise<any> {
        const user = await this.usersRepository.findUserLoginOrEmail({
            login: loginOrEmail,
            email: loginOrEmail
        })
        if (user === null) throw new UnauthorizedException(
            // callErrorMessage(ErrorEnums.USER_NOT_FOUND, "loginOrEmail")
        )


        const checkConfirmationAndHashContract = await user
            .checkConfirmationAndHash(
                user.accountData.passwordHash,
                password
            )
        if (checkConfirmationAndHashContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
            throw new UnauthorizedException()
        if (checkConfirmationAndHashContract.error === ErrorEnums.PASSWORD_NOT_COMPARED)
            throw new UnauthorizedException()

        return user;
    }

}