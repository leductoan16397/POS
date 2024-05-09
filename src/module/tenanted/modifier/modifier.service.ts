import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoggedUser } from 'src/common/type';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, FindOptionsWhere, ILike, In, IsNull, Repository } from 'typeorm';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { CreateModifierDto, FindModifierDto, UpdateModifierDto } from './dto/modifier.dto';
import { Modifier } from './entity/modifier.entity';
import { ModifierData } from './response/modifier.res';
import { Item } from '../item/entity/item.entity';

@Injectable()
export class ModifierService {
  private readonly modifierRepository: Repository<Modifier>;
  private readonly itemRepository: Repository<Item>;
  private readonly tenantUserRepository: Repository<TenantUser>;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.modifierRepository = connection.getRepository(Modifier);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.itemRepository = connection.getRepository(Item);
  }

  async createModifier({ input, user }: { input: CreateModifierDto; user: LoggedUser }) {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const { name, options, items } = input;

    let storedItem: Item[];
    if (items && items.length > 0) {
      storedItem = await this.itemRepository.findBy({ id: In(items) });
    }

    const modifier = this.modifierRepository.create({
      name,
      options,
      items: storedItem?.length > 0 ? storedItem : [],
    });

    await this.modifierRepository.save(modifier);

    return this.findOne({ id: modifier.id });
  }

  async find({ page = 0, pageSize = 10, order = 'asc', sort = 'name', search, items, withoutItem }: FindModifierDto) {
    let where: FindOptionsWhere<Modifier> | FindOptionsWhere<Modifier>[] =
      (search && {
        name: ILike(`%${search.trim().toLowerCase()}%`),
      }) ||
      {};

    if (!!withoutItem) {
      where = {
        ...where,
        items: {
          id: IsNull(),
        },
      };
    } else if (items?.length > 0) {
      where = {
        ...where,
        items: {
          id: In(items),
        },
      };
    }

    const [data, total] = await this.modifierRepository.findAndCount({
      where,
      relations: {
        items: true,
      },
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    const responseData: ModifierData[] = data.map((modifier) => {
      const m: ModifierData = {
        ...modifier,
        items: modifier.items.map((c) => c.id),
      };
      return m;
    });

    return { data: responseData, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateModifierDto }) {
    const modifier = await this.modifierRepository.findOne({
      where: { id },
    });

    if (!modifier) {
      throw new BadRequestException('Modifier Not Found');
    }

    let items: Item[] | null;
    if (updateInput.items) {
      items = await this.itemRepository.findBy({ id: In(updateInput.items) });
      if (items?.length === 0) {
        throw new BadRequestException('Item Not Found');
      }
      modifier.items = items;
    } else {
      items = null;
    }

    await this.modifierRepository.save({
      id,
      ...updateInput,
      items,
    });
    return this.findOne({ id });
  }

  async findOne({ id }: { id: string }) {
    const modifier = await this.modifierRepository.findOne({
      where: { id },
      relations: {
        items: true,
      },
    });

    if (!modifier) {
      return null;
    }

    return new ModifierData({
      ...modifier,
      items: modifier.items.map((c) => c.id),
    });
  }

  async remove({ id }: { id: string }) {
    const rs = await this.modifierRepository.delete({ id });
    return rs;
  }
}
