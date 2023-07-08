import { Injectable } from '@nestjs/common'
import jwt from 'jsonwebtoken'


@Injectable()
export class TokensService {

    createToken(newTokenPayload: any, secret: string, expires: string): string {

        const newToken = jwt.sign(newTokenPayload, secret, { expiresIn: expires })
        return newToken
    }


    verifyToken(token: string, secret: string): null | any {

        try {
            const result = jwt.verify(token, secret) as any
            return result

        } catch (err) {
            return null
        }

    }

}