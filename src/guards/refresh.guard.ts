import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import { TokensService } from "../services/tokens.service"
import { settings } from "../settings"
import { Request } from "express"

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(protected tokensService: TokensService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException("Not found token in request")

    const payload = await this.tokensService.verifyToken(token, settings.REFRESH_JWT_SECRET)
    if (payload === null) throw new UnauthorizedException("Not verify token")
    request["deviceSession"] = payload
    // request["user"] = payload
    return true
  }

  private extractTokenFromHeader(request: Request): string {
    return request.cookies.refreshToken
  }
}
