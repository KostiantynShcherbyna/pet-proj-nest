import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';;
import { Request } from 'express';

@Injectable()
export class BasicGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Basic token is required');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Basic' ? token : null;
  }

}