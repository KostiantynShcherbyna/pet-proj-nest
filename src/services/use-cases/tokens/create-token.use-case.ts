import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"


@Injectable()
export class CreateToken {
    constructor(
        private jwtService: JwtService
    ) {
    }

    async execute(newTokenPayload: any, secret: string, expiresIn: string): Promise<string> {
        const newToken = await this.jwtService.signAsync(newTokenPayload, { secret, expiresIn })
        return newToken
    }

}