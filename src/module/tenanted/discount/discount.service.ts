import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Pagination } from '../../../common/common.response';
import { Store } from '../store/entity/store.entity';
import { CreateDiscountDto, GetDiscountListDto, UpdateDiscountDto } from './dto/discount.dto';
import { Discount } from './entity/discount.entity';
import { DiscountData } from './response/discount.res';

@Injectable()
export class DiscountService {
  private readonly discountRepository: Repository<Discount>;
  private readonly storeRepository: Repository<Store>;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.discountRepository = connection.getRepository(Discount);
    this.storeRepository = connection.getRepository(Store);
  }

  async getList({
    page = 0,
    pageSize = 10,
    order = 'desc',
    sort = 'name',
    search,
  }: GetDiscountListDto): Promise<Pagination<Discount>> {
    const where: FindOptionsWhere<Discount> | FindOptionsWhere<Discount>[] =
      (search && [
        {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      ]) ||
      {};
    const [data, total] = await this.discountRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    return { data, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async findOne(id: string): Promise<Discount | undefined> {
    return this.discountRepository.findOne({
      where: { id },
    });
  }

  async store(data: CreateDiscountDto): Promise<DiscountData> {
    const { name, storeIds, type, value, code } = data;
    const stores = await this.storeRepository.findBy({ id: In(storeIds) });

    if (stores.length === 0) {
      throw new BadRequestException('Store Not Found');
    }

    const discount = this.discountRepository.create({
      name,
      stores,
      type,
      value,
      code: code || v4(),
    });

    const newDiscount = await this.discountRepository.save(discount);

    return new DiscountData(newDiscount);
  }

  async update({ id, data }: { id: string; data: UpdateDiscountDto }): Promise<DiscountData> {
    const discount: Discount | null = await this.discountRepository.findOne({
      where: { id },
    });

    if (!discount) {
      throw new BadRequestException('Store Not Found');
    }

    const update: Partial<Discount> = {};
    if (data.storeIds?.length > 0) {
      const stores = await this.storeRepository.findBy({ id: In(data.storeIds) });
      update.stores = stores;
    }

    if (data.storeIds?.length === 0) {
      update.stores = null;
    }

    await this.discountRepository.save({
      id,
      code: data.code,
      name: data.name,
      type: data.type,
      value: data.value,
      stores: update.stores,
    });

    const newDiscount = await this.discountRepository.findOneBy({ id });
    return new DiscountData(newDiscount);
  }

  async destroy(id: string) {
    return this.discountRepository.softDelete(id);
  }

  async findByIds(ids: string[]): Promise<Discount[]> {
    return this.discountRepository.find({ where: { id: In(ids) } });
  }
}
