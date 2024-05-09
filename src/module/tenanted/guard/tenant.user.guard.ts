import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Request } from 'express';

@Injectable()
export class TenantUserGuard implements CanActivate {
  private readonly tenantUserRepository: Repository<TenantUser>;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.tenantUserRepository = connection.getRepository(TenantUser);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { user } = request;

    const tenantUser = await this.tenantUserRepository.findOne({
      where: { userId: user?.id },
      relations: {
        group: true,
      },
    });

    if (!tenantUser) {
      throw new ForbiddenException();
    }

    user.permissions = [...tenantUser.group?.manageBackOffice, ...tenantUser.group?.managePos];

    return true;
  }
}
