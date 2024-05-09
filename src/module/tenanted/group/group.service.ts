import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { AccessGroup } from './entity/group.entity';
import { TenantUserGroupData } from './response/group.res';
import { CreateAccessGroupDto, FindAccessGroupDto, UpdateTenantUserGroupDto } from './dto/group.dto';

@Injectable()
export class TenantUserGroupService {
  private readonly tenantUserGroupRepository: Repository<AccessGroup>;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.tenantUserGroupRepository = connection.getRepository(AccessGroup);
  }

  async create({ input }: { input: CreateAccessGroupDto }) {
    const { isManageBackOffice, isManagePos, name, manageBackOffice, managePos } = input;

    const itemVariant = this.tenantUserGroupRepository.create({
      name,
      isManagePos,
      isManageBackOffice,
      ...(isManagePos && { managePos }),
      ...(isManageBackOffice && { manageBackOffice }),
    });

    await this.tenantUserGroupRepository.save(itemVariant);

    return this.findOne({ id: itemVariant.id });
  }

  async find({ page = 0, pageSize = 10, order = 'asc', sort = 'name', search }: FindAccessGroupDto) {
    const where: FindOptionsWhere<AccessGroup> | FindOptionsWhere<AccessGroup>[] =
      (search && [
        {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      ]) ||
      {};
    const [data, total] = await this.tenantUserGroupRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      relations: {
        staffs: true,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    return {
      data: data.map(
        (d) =>
          new TenantUserGroupData({
            ...d,
            totalEmployee: d.staffs.length,
          }),
      ),
      page,
      pageSize,
      total,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateTenantUserGroupDto }) {
    const group = await this.tenantUserGroupRepository.findOne({
      where: { id },
    });

    if (!group) {
      throw new BadRequestException('Group Not Found');
    }

    if (!group.updateAble) {
      throw new BadRequestException('Cannot update this group');
    }

    const { isManageBackOffice, isManagePos, name } = updateInput;

    if (isManagePos !== undefined && !isManagePos) {
      updateInput.managePos = [];
    }

    if (isManageBackOffice !== undefined && !isManageBackOffice) {
      updateInput.manageBackOffice = [];
    }

    await this.tenantUserGroupRepository.save({
      id,
      name,
      isManageBackOffice,
      isManagePos,
      ...(!!updateInput.isManageBackOffice && {
        manageBackOffice: updateInput.manageBackOffice,
      }),
      ...(!!updateInput.isManagePos && {
        managePos: updateInput.managePos,
      }),
    });

    const newCategory = await this.tenantUserGroupRepository.findOne({
      where: { id },
      relations: {
        staffs: true,
      },
    });

    return new TenantUserGroupData({ ...newCategory, totalEmployee: newCategory.staffs.length });
  }

  async findOne({ id }: { id: string }) {
    const item = await this.tenantUserGroupRepository.findOne({
      where: { id },
      relations: {
        staffs: true,
      },
    });
    return new TenantUserGroupData({ ...item, totalEmployee: item.staffs.length });
  }

  async remove({ id }: { id: string }) {
    const group = await this.tenantUserGroupRepository.findOne({
      where: { id },
      relations: {
        staffs: true,
      },
    });

    if (!group) {
      throw new BadRequestException('Group Not Found');
    }

    if (!group.deleteAble || group.staffs?.length > 0) {
      throw new BadRequestException('Cannot delete this group');
    }

    const rs = await this.tenantUserGroupRepository.delete({ id });
    return rs;
  }
}
