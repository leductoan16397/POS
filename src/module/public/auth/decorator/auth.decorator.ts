import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RolesGuard } from '../guard/roles.guard';
import { ROLES_KEY } from './roles.decorator';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { UserRole } from 'src/common/enum';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(JwtAuthGuard, RolesGuard));
}
