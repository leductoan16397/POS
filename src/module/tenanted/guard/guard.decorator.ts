import { UserRole } from 'src/common/enum';
import { TenantUserGuard } from './tenant.user.guard';
import { JwtAuthGuard } from 'src/module/public/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/module/public/auth/guard/roles.guard';
import { PermissionsGuard } from './tenant.permission.guard';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ROLES_KEY } from 'src/module/public/auth/decorator/roles.decorator';
import { TenantPermissionType } from 'src/common/constant';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: string[]) =>
  applyDecorators(SetMetadata(PERMISSIONS_KEY, permissions), UseGuards(PermissionsGuard));

export const AuthPermissions = (...permissions: TenantPermissionType[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    SetMetadata(ROLES_KEY, [UserRole.CompanyOwner, UserRole.CompanyAdmin, UserRole.CompanyUser]),
    UseGuards(JwtAuthGuard, RolesGuard, TenantUserGuard, PermissionsGuard),
  );
