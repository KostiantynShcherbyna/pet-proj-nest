import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import { TokensService } from "./services/tokens.service"
import { settings } from "./settings"
import { Request } from "express"

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(protected tokensService: TokensService) {
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException("Not found token in request")

    try {
      const payload = await this.tokensService.verifyToken(
        token,
        settings.REFRESH_JWT_SECRET,
      )
      request["deviceSession"] = payload
      // request["user"] = payload
    } catch {
      throw new UnauthorizedException("Not verify token")
    }
    return true
  }
  private extractTokenFromHeader(request: Request): string {
    return request.cookies.refreshToken
  }
}
