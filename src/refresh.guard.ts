import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokensService } from './services/tokens.service';
import { settings } from './settings';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(protected jwtCustomService: TokensService) { }
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.cookies.refreshToken) {
      throw new UnauthorizedException("refreshToken don't exist in cookies");
    }

    const deviceSession = this.jwtCustomService.verifyToken(request.cookies.refreshToken, settings.REFRESH_JWT_SECRET)
    if (deviceSession === null) {
      throw new UnauthorizedException("refreshToken invalid or expired");
    }

    request.deviceSession = deviceSession

    return true;
  }
}
