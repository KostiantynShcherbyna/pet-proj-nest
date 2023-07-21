import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"


@Injectable()
export class VerifyToken {
    constructor(
        private jwtService: JwtService
    ) {
    }

    async execute(token: string, secret: string): Promise<null | any> {
        try {
            const result = await this.jwtService.verifyAsync(token, { secret })
            return result

        } catch (err) {
            return null
        }

    }

}