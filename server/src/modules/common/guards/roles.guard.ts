import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from '@/decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const cls = ctx.getClass();

    // Cho phép route @Public() bỏ qua check role
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      handler,
      cls,
    ]);
    if (isPublic) return true;

    // Lấy roles yêu cầu từ metadata
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [handler, cls],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      // Route không set @Roles() → không cần check role
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { id: string; role?: AppRole } | undefined;

    if (!user || !user.role) {
      throw new ForbiddenException('Unauthorized: missing user or role');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Forbidden: role "${user.role}" not allowed`,
      );
    }

    return true;
  }
}
