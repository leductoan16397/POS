import { Inject, Injectable } from '@nestjs/common';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, In, Repository } from 'typeorm';
import { CheckSkuExistsDto, CheckSkusExistsDto, GetNextSkuDto } from './dto/item.dto';
import { Item } from './entity/item.entity';
import { ItemVariant } from './entity/item.variant.entity';
import { NextSkuData } from './response/item.variant.res';
import { SKU_MIN_LENGTH, SKU_PREFIX, SkuType } from './utils/item.variant.cons';

@Injectable()
export class SkuService {
  private readonly itemRepository: Repository<Item>;
  private readonly itemVariantRepository: Repository<ItemVariant>;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.itemRepository = connection.getRepository(Item);
    this.itemVariantRepository = connection.getRepository(ItemVariant);
  }

  async checkSkuExists({ sku, type }: CheckSkuExistsDto): Promise<boolean> {
    if (type === SkuType.Item) {
      return this.itemRepository.exist({ where: { sku } });
    } else {
      return this.itemVariantRepository.exist({ where: { sku } });
    }
  }

  async checkSkusExists({ skus, type }: CheckSkusExistsDto): Promise<string[]> {
    let items: Item[] | ItemVariant[] = [];
    if (type === SkuType.Item) {
      items = await this.itemRepository.find({ select: ['sku'], where: { sku: In(skus) } });
    } else {
      items = await this.itemVariantRepository.find({ select: ['sku'], where: { sku: In(skus) } });
    }

    const dbSkus = items.map((item) => item.sku);

    return skus.filter((sku) => {
      return dbSkus.includes(sku);
    });
  }

  async getNextSku({ type }: GetNextSkuDto): Promise<NextSkuData> {
    let maxSku = 0;

    if (type === SkuType.Item) {
      maxSku = await this.itemRepository.maximum('sku_id');
    } else {
      maxSku = await this.itemVariantRepository.maximum('sku_id');
    }

    return { sku: (maxSku + 1).toString().padStart(SKU_MIN_LENGTH, SKU_PREFIX) };
  }
}
