import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as lodash from 'lodash';
import { sortBy } from 'lodash';
import { LoggedUser } from 'src/common/type';
import { parseXlsx } from 'src/common/utils';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, FindOptionsWhere, ILike, In, IsNull, Not, Repository } from 'typeorm';
import { Category } from '../category/entity/category.entity';
import { Modifier } from '../modifier/entity/modifier.entity';
import { Store } from '../store/entity/store.entity';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { CreateItemDto, ExportItemDto, FindItemDto, UpdateItemDto } from './dto/item.dto';
import { Item, ShowType, SoldType } from './entity/item.entity';
import { ItemVariant, ItemVariantStore } from './entity/item.variant.entity';
import { ItemData } from './response/item.res';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';

@Injectable()
export class ItemService {
  private readonly itemRepository: Repository<Item>;
  private readonly itemVariantRepository: Repository<ItemVariant>;
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly categoryRepository: Repository<Category>;
  private readonly storeRepository: Repository<Store>;
  private readonly modifierRepository: Repository<Modifier>;
  private readonly companyConfigData: CompanyConfig;

  constructor(@Inject(CONNECTION) connection: DataSource, @Inject(COMPANY_CONFIG) companyConfigData: CompanyConfig) {
    this.companyConfigData = companyConfigData;
    this.itemRepository = connection.getRepository(Item);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.categoryRepository = connection.getRepository(Category);
    this.itemVariantRepository = connection.getRepository(ItemVariant);
    this.storeRepository = connection.getRepository(Store);
    this.modifierRepository = connection.getRepository(Modifier);
  }

  async createItem({ input, user }: { input: CreateItemDto; user: LoggedUser }) {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const { category, options, showType, color, icon, image, variants, modifiers } = input;

    let storedCategory: Category;
    if (category) {
      storedCategory = await this.categoryRepository.findOneBy({ id: category });
    }

    let storedModifiers: Modifier[];
    if (modifiers) {
      storedModifiers = await this.modifierRepository.findBy({ id: In(modifiers) });
    }

    if (showType === ShowType.ColorAndIcon) {
      if (!color) {
        throw new BadRequestException('Missing "color"');
      }
      if (!icon) {
        throw new BadRequestException('Missing "icon"');
      }
    }

    if (showType === ShowType.Image) {
      if (!image) {
        throw new BadRequestException('Missing "image"');
      }
    }

    const checkVariantsOptions = variants?.some(
      (variant: ItemVariant) =>
        Object.keys(variant.options).length !== options.length ||
        !lodash.isEqual(sortBy(options), sortBy(Object.keys(variant.options))),
    );

    if (checkVariantsOptions) {
      throw new BadRequestException('Variant Have Invalid Option');
    }

    const item = this.itemRepository.create({
      ...input,
      categories: storedCategory ? [storedCategory] : [],
      modifiers: storedModifiers?.length > 0 ? storedModifiers : [],
    });

    item.variants = variants.map((variant) => {
      return this.itemVariantRepository.create(variant);
    });

    await this.itemRepository.save(item);

    return this.findOne({ id: item.id });
  }

  async find({
    page = 0,
    pageSize = 10,
    order = 'asc',
    sort = 'name',
    search,
    categories,
    withoutCategory,
  }: FindItemDto) {
    let where: FindOptionsWhere<Item> | FindOptionsWhere<Item>[] =
      (search && {
        name: ILike(`%${search.trim().toLowerCase()}%`),
      }) ||
      {};

    if (!!withoutCategory) {
      where = {
        ...where,
        categories: {
          id: IsNull(),
        },
      };
    } else if (categories?.length > 0) {
      where = {
        ...where,
        categories: {
          id: In(categories),
        },
      };
    }

    const [data, total] = await this.itemRepository.findAndCount({
      where,
      relations: {
        variants: true,
        categories: true,
        modifiers: true,
      },
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    const responseData: ItemData[] = data.map((item) => {
      const category = item.categories.length ? item.categories[0] : null;

      const modifiers = item.modifiers.map((modifier) => {
        delete modifier.items;

        return modifier;
      });

      return {
        ...item,
        stock: 0,
        tax: category?.tax ?? 0,
        categories: item.categories.map((c) => c.id),
        modifiers,
      };
    });

    return { data: responseData, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateItemDto }) {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: {
        variants: true,
      },
    });

    if (!item) {
      throw new BadRequestException('Item Not Found');
    }

    const { showType, icon, image, color, variants, options } = updateInput;

    if (showType === ShowType.ColorAndIcon) {
      if (!color) {
        throw new BadRequestException('Missing "color"');
      }
      if (!icon) {
        throw new BadRequestException('Missing "icon"');
      }
    }

    if (showType === ShowType.Image) {
      if (!image) {
        throw new BadRequestException('Missing "image"');
      }
    }

    const checkVariantsOptions = variants?.some(
      (variant: ItemVariant) =>
        Object.keys(variant.options).length !== options.length ||
        !lodash.isEqual(sortBy(options), sortBy(Object.keys(variant.options))),
    );

    if (checkVariantsOptions) {
      throw new BadRequestException('Variant Have Invalid Option');
    }

    let categories: Category[] | null;
    if (updateInput.category) {
      categories = await this.categoryRepository.findBy({ id: updateInput.category });
      if (categories?.length === 0) {
        throw new BadRequestException('Category Not Found');
      }
      item.categories = categories;
    } else {
      categories = null;
    }

    let modifiers: Modifier[] | null;
    if (updateInput.modifiers) {
      modifiers = await this.modifierRepository.findBy({ id: In(updateInput.modifiers) });
      if (categories?.length === 0) {
        throw new BadRequestException('Category Not Found');
      }
      item.modifiers = modifiers;
    } else {
      modifiers = null;
    }

    // Check variants from db
    const variantIds = variants.reduce((ids, variant) => {
      if (variant?.id) {
        ids = [...ids, variant.id];
      }

      return ids;
    }, []);

    await this.itemVariantRepository.delete({ id: Not(In(variantIds)), item: { id } });

    let dbVariants: ItemVariant[] = [];
    if (variantIds.length > 0) {
      dbVariants = await this.itemVariantRepository.findBy({ id: In(variantIds) });
    }

    item.variants = [
      ...variants.reduce((newVariants, variant) => {
        if (variant?.id) {
          const dbVariant = dbVariants.find((dbItem) => dbItem.id === variant.id);

          if (dbVariant) {
            return [
              ...newVariants,
              {
                ...dbVariant,
                ...variant,
              },
            ];
          } else {
            return newVariants;
          }
        }

        return [
          ...newVariants,
          this.itemVariantRepository.create({
            ...variant,
            item,
          }),
        ];
      }, []),
    ];

    await this.itemRepository.save({
      id,
      ...updateInput,
      categories,
      variants: item.variants,
      modifiers,
    });

    return this.findOne({ id });
  }

  async findOne({ id }: { id: string }) {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: {
        variants: true,
        categories: true,
        modifiers: true,
      },
    });

    const category = item.categories.length ? item.categories[0] : null;

    const modifiers = item.modifiers.map((modifier) => {
      delete modifier.items;

      return modifier;
    });

    return new ItemData({
      ...item,
      stock: 0,
      tax: category?.tax ?? 0,
      categories: item.categories.map((c) => c.id),
      modifiers,
    });
  }

  async remove({ id }: { id: string }) {
    await this.itemVariantRepository.softDelete({ item: { id } });

    const rs = await this.itemRepository.softDelete({ id });
    return rs;
  }

  async template() {
    const itemData = [
      {
        name: 'name',
        description: 'description',
        sold_by_weight: 'each',
        category: '',
        sku: 'sku',
        cost: '123',
        price: '1000',
        barcode: 'barcode',
        'option 1 name': 'size',
        'option 1 value': 'm',
      },
    ];
    return itemData;
  }

  async import({
    file,
    loggedUser,
  }: {
    file: Express.Multer.File;

    loggedUser: LoggedUser;
  }) {
    const defaultKey = ['description', 'name', 'sold_by_weight', 'price', 'cost', 'sku', 'barcode'];
    const xlsxData = parseXlsx(file.buffer);
    const firstSheet = xlsxData[0].data;
    // verify header
    const keys = Object.keys(firstSheet[0]);
    if (defaultKey.some((k) => !keys.includes(k))) {
      throw new BadRequestException('Format wrong');
    }

    const optionKeyName = keys.filter((k) => /option \d name/.test(k)).sort();
    const optionKeyValue = keys.filter((k) => /option \d value/.test(k)).sort();

    if (optionKeyName.length !== optionKeyValue.length) {
      throw new BadRequestException('Format wrong');
    }

    if (firstSheet.length === 0) {
      throw new BadRequestException('No data');
    }

    const itemGroupByName = lodash.groupBy(firstSheet, 'sku');
    const stores = await this.storeRepository.find();

    for (const iterator in itemGroupByName) {
      const data = itemGroupByName[iterator];
      const options = [];
      optionKeyName.forEach((k) => data[0][k] && options.push(data[0][k]));
      const fileCategory = data.find((d) => !!d.category)?.category || '';

      let category = await this.categoryRepository.findOne({
        where: {
          name: ILike(`%${fileCategory.trim()?.toLowerCase()}%`),
        },
      });

      if (!category) {
        category = new Category();
        category.name = fileCategory.trim()?.toLowerCase();
        category.color = 'red';
        category.tax = 0;
        category.createdBy = loggedUser.id;

        await this.categoryRepository.save(category);
      }

      const item = this.itemRepository.create({
        name: data[0].name,
        description: data.find((d) => !!d.description)?.description || null,
        // soldBy: data[0].sold_by_weight || SoldType.Each,
        soldBy:
          (data
            .find((d) => !!d.sold_by_weight)
            ?.sold_by_weight?.trim()
            ?.toLowerCase() === SoldType.Volume.toLowerCase() &&
            SoldType.Volume) ||
          SoldType.Each,
        options,
        color: 'red',
        icon: 'circle',
        price: data[0].price,
        cost: data[0].cost,
        barcode: data[0].barcode,
        sku: data[0].sku,
        categories: [category],
      });
      const variants = [];

      for (let index = 0; index < data.length; index++) {
        const variant = data[index];
        const options = {};

        if (optionKeyName.length === 0) {
          continue;
        }

        optionKeyName.forEach((n, i) => {
          if (variant[optionKeyValue[i]]) {
            options[variant[n]] = variant[optionKeyValue[i]];
          }
        });

        if (lodash.isEmpty(options)) {
          continue;
        }

        const v = {
          sku: variant.sku,
          options,
          price: variant.price,
          cost: variant.cost,
          barcode: variant.barcode,
          stores: stores.map((s) => {
            const store: ItemVariantStore = {
              storeId: s.id,
              isAvailable: false,
              price: variant.price,
            };
            return store;
          }),
        };
        console.log(`${new Date().toString()} 🚀 ~ file: item.service.ts:343 ~ ItemService ~ variants ~ v:`, v);
        const nv = this.itemVariantRepository.create(v);
        variants.push(nv);
      }

      item.variants = variants;

      await this.itemRepository.save(item);
    }
    return 'Import completed';
  }

  async export({ categories, withoutCategory }: ExportItemDto) {
    let where: FindOptionsWhere<Item> | FindOptionsWhere<Item>[] = {};

    if (!!withoutCategory) {
      where = {
        ...where,
        categories: {
          id: IsNull(),
        },
      };
    } else if (categories?.length > 0) {
      where = {
        ...where,
        categories: {
          id: In(categories),
        },
      };
    }

    const items = await this.itemRepository.find({
      where,
      relations: {
        variants: true,
        categories: true,
      },
    });
    const itemVariants = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemData = {
        name: item.name,
        description: item.description,
        sold_by_weight: item.soldBy,
        track_stock: item.trackStock,
        category: item.categories.map((c) => c.name).join(','),
      };

      if (item.variants.length > 0) {
        for (let index = 0; index < item.variants.length; index++) {
          const element = item.variants[index];

          const option = {};

          Object.keys(element.options).forEach((v, i) => {
            option[`option ${i + 1} name`] = v;
            option[`option ${i + 1} value`] = element.options[v];
          });

          const variant = {
            ...itemData,
            price: element.price,
            cost: element.cost,
            sku: element.sku,
            barcode: element.barcode,
            in_stock: element.inStock,
            low_stock: element.lowStock,
            optimal_stock: element.optimalStock,
            ...option,
          };

          itemVariants.push(variant);
        }
      } else {
        const option = {};

        Object.keys(item.options).forEach((v, i) => {
          option[`option ${i + 1} name`] = v;
          option[`option ${i + 1} calue`] = '';
        });
        const variant = {
          ...itemData,
          price: item.price,
          cost: item.cost,
          sku: item.sku,
          barcode: item.barcode,
          in_stock: item.inStock,
          low_stock: item.lowStock,
          optimal_stock: item.optimalStock,
          ...option,
        };
        itemVariants.push(variant);
      }
    }

    return lodash.orderBy(itemVariants, ['name'], ['asc']);
  }
}
