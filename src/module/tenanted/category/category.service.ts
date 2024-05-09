import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Pagination } from 'src/common/common.response';
import { LoggedUser } from 'src/common/type';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Item } from '../item/entity/item.entity';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { CreateCategoryDto, FindCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entity/category.entity';
import { CategoryData } from './response/category.res';

@Injectable()
export class CategoryService {
  private readonly categoryRepository: Repository<Category>;
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly itemRepository: Repository<Item>;
  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.categoryRepository = connection.getRepository(Category);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.itemRepository = connection.getRepository(Item);
    this.connection = connection;
  }

  async createCategory({
    loggedUser: user,
    input: { color, items, name, tax },
  }: {
    input: CreateCategoryDto;
    loggedUser: LoggedUser;
  }): Promise<CategoryData> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const category = new Category();
    category.name = name;
    category.color = color;
    category.tax = tax;
    category.createdBy = tenantUser.id;

    if (items) {
      const itemList = await this.itemRepository.find({ where: { id: In(items) } });
      category.items = itemList;
    }

    try {
      await this.categoryRepository.save(category);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: category.service.ts:48 ~ CategoryService ~ error:`, error);
      throw error;
    }

    return new CategoryData(category);
  }

  async find({
    page = 0,
    pageSize = 10,
    order = 'asc',
    sort = 'name',
    search,
  }: FindCategoryDto): Promise<Pagination<CategoryData>> {
    const where: FindOptionsWhere<Category> | FindOptionsWhere<Category>[] =
      (search && [
        {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      ]) ||
      {};
    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    const categories = await Promise.all(
      data.map(async (d) => {
        const totalItem = await this.itemRepository.countBy({
          categories: {
            id: d.id,
          },
        });
        return { ...d, totalItem };
      }),
    );

    return { data: categories, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async findActive(): Promise<CategoryData[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('c')
      .innerJoin('c.items', 'i')
      .groupBy('c.id')
      .having('COUNT(i.id) > 0')
      .select('c.*, COUNT(i.id) as total_item')
      .execute();

    return data.map((category: Category & { total_item: string; tax: string }) => {
      return new CategoryData({
        ...this.categoryRepository.create({ ...category, tax: Number.parseFloat(category.tax) }),
        totalItem: Number.parseInt(category.total_item),
      });
    });
  }

  async findOne({ id }: { id: string }) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new BadRequestException('Category Not Found');
    }
    const totalItem = await this.itemRepository.countBy({
      categories: {
        id: category.id,
      },
    });
    return new CategoryData({ ...category, totalItem });
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateCategoryDto }) {
    const category = await this.categoryRepository.findOneBy({ id });
    const { color, items, name, tax } = updateInput;
    if (!category) {
      throw new BadRequestException('Category Not Found');
    }

    category.name = name;
    category.color = color;
    category.tax = tax;

    if (items) {
      if (items.length) {
        const itemList = await this.itemRepository.find({ where: { id: In(updateInput.items) } });
        category.items = itemList;
      } else {
        category.items = [];
      }
    }

    await this.categoryRepository.save(category);

    const newCategory = await this.categoryRepository.findOne({
      where: {
        id: category.id,
      },
      relations: { items: true },
    });
    const totalItem = await this.itemRepository.countBy({
      categories: {
        id: newCategory.id,
      },
    });
    return new CategoryData({ ...newCategory, totalItem });
  }

  async remove({ id }: { id: string }) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new BadRequestException('Category Not Found');
    }

    const totalItem = await this.itemRepository.countBy({
      categories: {
        id: category.id,
      },
    });

    if (totalItem > 0) {
      throw new BadRequestException('Cannot Delete Category');
    }

    return this.categoryRepository.softDelete({ id });
    // return await this.categoryRepository.softDelete({ id })

    // const items = await this.itemRepository.find({
    //   where: {
    //     categories: {
    //       id: id,
    //     },
    //   },
    // });

    // const queryRunner = this.connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    // const categoryRepository = queryRunner.manager.getRepository(Category);
    // const itemRepository = queryRunner.manager.getRepository(Item);

    // try {
    //   for (let index = 0; index < items.length; index++) {
    //     const item = items[index];
    //     item.categories = item.categories.filter((c) => c.id !== id);
    //     await itemRepository.save(item);
    //   }

    //   const rs = await categoryRepository.delete({ id });
    //   await queryRunner.commitTransaction();
    //   return rs;
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();
    //   throw error;
    // } finally {
    //   await queryRunner.release();
    // }
  }
}
