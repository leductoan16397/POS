import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RolesGuard } from '../guard/roles.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard));
