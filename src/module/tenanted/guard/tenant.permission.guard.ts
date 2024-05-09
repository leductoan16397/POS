import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from './guard.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(@Inject(Reflector.name) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const { user } = request;

    const isCanActive = requiredPermissions.some((p) => user.permissions?.includes(p));

    return isCanActive;
  }
}
