import { BadRequestException, HttpStatus, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountType } from 'src/common/enum';
import { LoggedUser } from 'src/common/type';
import { convertNumberToFloat } from 'src/common/utils';
import { MailService } from 'src/module/common/mail/mail.service';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Company } from 'src/module/public/company/entity/company.entity';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { DataSource, FindOptionsWhere, ILike, In, IsNull, Repository } from 'typeorm';
import { Customer } from '../customer/entity/customer.entity';
import { Discount } from '../discount/entity/discount.entity';
import { Item } from '../item/entity/item.entity';
import { ItemVariant } from '../item/entity/item.variant.entity';
import { Modifier } from '../modifier/entity/modifier.entity';
import { Shift } from '../shift/entity/shift.entity';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { FindTicketDto, ItemTicketDto, SaveTicketDto, SendEmailDto, UpdateTicketDto } from './dto/ticket.dto';
import { DiscountTicket } from './entity/discount.ticket.entity';
import { ItemTicket } from './entity/item.ticket.entity';
import { ItemTicketModifier } from './entity/item.ticket.modifier.entity';
import { Receipt } from './entity/receipt.entity';
import { Ticket } from './entity/ticket.entity';
import { DiscountTicketData } from './response/discount.ticket.res';
import { ItemTicketData } from './response/item.ticket.res';
import { TicketData } from './response/ticket.res';
import { ItemTicketType, PaymentStatus, TicketType } from './utils/enum';
import { generateVariantName } from './utils/helper';

@Injectable()
export class TicketService {
  private readonly connection: DataSource;
  private readonly ticketRepository: Repository<Ticket>;
  private readonly modifierRepository: Repository<Modifier>;
  private readonly itemTicketRepository: Repository<ItemTicket>;
  private readonly itemTicketModifierRepository: Repository<ItemTicketModifier>;
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly shiftRepository: Repository<Shift>;
  private readonly itemRepository: Repository<Item>;
  private readonly discountsRepository: Repository<Discount>;
  private readonly itemVariantRepository: Repository<ItemVariant>;
  private readonly customerRepository: Repository<Customer>;
  private readonly discountTicketRepository: Repository<DiscountTicket>;
  private readonly receiptRepository: Repository<Receipt>;
  private readonly companyConfig: CompanyConfig;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyConfig) private readonly companyConfigRepository: Repository<CompanyConfig>,
    private mailService: MailService,
    @Inject(COMPANY_CONFIG) companyConfig: CompanyConfig,
  ) {
    this.connection = connection;
    this.ticketRepository = connection.getRepository(Ticket);
    this.modifierRepository = connection.getRepository(Modifier);
    this.itemTicketRepository = connection.getRepository(ItemTicket);
    this.itemTicketModifierRepository = connection.getRepository(ItemTicketModifier);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.shiftRepository = connection.getRepository(Shift);
    this.itemRepository = connection.getRepository(Item);
    this.discountsRepository = connection.getRepository(Discount);
    this.itemVariantRepository = connection.getRepository(ItemVariant);
    this.customerRepository = connection.getRepository(Customer);
    this.discountTicketRepository = connection.getRepository(DiscountTicket);
    this.receiptRepository = connection.getRepository(Receipt);
    this.companyConfig = companyConfig;
  }

  async save(user: LoggedUser, body: SaveTicketDto): Promise<TicketData> {
    try {
      const tenantUser = await this._checkTenantUser(user);

      if (!tenantUser) {
        throw new BadRequestException('User Not Found');
      }

      let customer: Customer;
      if (body.customer) {
        customer = await this.customerRepository.findOneBy({ id: body.customer });

        if (!customer) {
          throw new BadRequestException('Customer is not exists');
        }
      }

      let shift: Shift;
      if (body.shift) {
        shift = await this.shiftRepository.findOne({
          where: { id: body.shift, closedAt: IsNull(), user: { id: tenantUser.id } },
          relations: { user: true },
        });

        if (!shift || shift.user.id !== tenantUser.id) {
          throw new BadRequestException('Shift is invalid');
        }
      }

      const {
        totalPrice,
        totalDiscount,
        items,
        discounts: updatedDiscount,
        totalPriceOriginal,
        totalTaxAmount,
      } = await this._calculateTicket({ items: body.items, discounts: body?.discounts ?? [] });

      if (convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces) !== body.totalAmount) {
        throw new BadRequestException({
          message: 'Total Amount is not correct!',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          correctTotal: convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces),
        });
      }

      let ticket = this.ticketRepository.create({
        ...body,
        totalPrice: convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces),
        totalDiscount: convertNumberToFloat(totalDiscount, this.companyConfig.decimalPlaces),
        customer,
        shift,
        itemTickets: items,
        discountTickets: updatedDiscount,
        user: tenantUser,
        totalPriceOriginal: convertNumberToFloat(totalPriceOriginal, this.companyConfig.decimalPlaces),
        totalTaxAmount: convertNumberToFloat(totalTaxAmount, this.companyConfig.decimalPlaces),
      });

      ticket = await this.ticketRepository.save(ticket);

      ticket = await this.ticketRepository.findOne({
        where: { id: ticket.id },
        relations: { itemTickets: { modifiers: true }, discountTickets: true, receipts: true },
      });

      return new TicketData({
        ...ticket,
        itemTickets: ticket.itemTickets.map((item) => new ItemTicketData({ ...item })),
        discountTickets: ticket.discountTickets.map((item) => new DiscountTicketData({ ...item })),
      });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: ticket.service.ts ~ TicketService::save ~ error:`, error);
      throw error;
    }
  }

  async update(user: LoggedUser, id: string, body: UpdateTicketDto): Promise<TicketData> {
    try {
      const tenantUser = await this._checkTenantUser(user);

      if (!tenantUser) {
        throw new BadRequestException('User Not Found');
      }

      let customer: Customer;
      if (body.customer) {
        customer = await this.customerRepository.findOneBy({ id: body.customer });

        if (!customer) {
          throw new BadRequestException('Customer is not exists');
        }
      }

      let shift: Shift;
      if (body.shift) {
        shift = await this.shiftRepository.findOne({
          where: { id: body.shift, closedAt: IsNull(), user: { id: tenantUser.id } },
          relations: { user: true },
        });

        if (!shift || shift.user.id !== tenantUser.id) {
          throw new BadRequestException('Shift is invalid');
        }
      }

      const {
        totalPrice,
        totalDiscount,
        items,
        discounts: updatedDiscount,
        totalPriceOriginal,
        totalTaxAmount,
      } = await this._calculateTicket({ items: body.items, discounts: body?.discounts ?? [] });

      if (convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces) !== body.totalAmount) {
        throw new BadRequestException({
          message: 'Total Amount is not correct!',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          correctTotal: convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces),
        });
      }

      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const localItemTicketRepo = queryRunner.manager.getRepository(ItemTicket);
      const localDiscountTicketRepository = queryRunner.manager.getRepository(DiscountTicket);
      const localTicketRepo = queryRunner.manager.getRepository(Ticket);
      const itemTicketModifierRepository = queryRunner.manager.getRepository(ItemTicketModifier);

      try {
        const itemTickets = await localItemTicketRepo.find({
          where: {
            ticket: { id },
          },
        });

        await Promise.all([
          itemTicketModifierRepository.delete({
            itemTicket: {
              id: In(itemTickets.map((i) => i.id)),
            },
          }),
          localItemTicketRepo.delete({ ticket: { id } }),
          localDiscountTicketRepository.delete({ ticket: { id } }),
        ]);

        delete body.items;
        delete body.discounts;

        await localTicketRepo.save({
          id,
          ...body,
          totalPrice: convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces),
          totalDiscount: convertNumberToFloat(totalDiscount, this.companyConfig.decimalPlaces),
          customer,
          shift,
          itemTickets: items,
          discountTickets: updatedDiscount,
          user: tenantUser,
          totalPriceOriginal: convertNumberToFloat(totalPriceOriginal, this.companyConfig.decimalPlaces),
          totalTaxAmount: convertNumberToFloat(totalTaxAmount, this.companyConfig.decimalPlaces),
        });

        const updatedTicket = await localTicketRepo.findOne({
          where: { id },
          relations: { itemTickets: { modifiers: true }, discountTickets: true },
        });

        await queryRunner.commitTransaction();

        return new TicketData({
          ...updatedTicket,
          itemTickets: updatedTicket.itemTickets.map((item) => new ItemTicketData(item)),
          discountTickets: updatedTicket.discountTickets.map((item) => new DiscountTicketData(item)),
        });
      } catch (error) {
        console.log(
          `${new Date().toString()} 🚀 ~ file: ticket.service.ts:242 ~ TicketService ~ update ~ error:`,
          error,
        );
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: ticket.service.ts:252 ~ TicketService ~ update ~ error:`, error);
      throw error;
    }
  }

  _checkTenantUser(user: LoggedUser): Promise<TenantUser | null> {
    return this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async _calculateTicket(body: { items: ItemTicketDto[]; discounts: string[] }): Promise<{
    totalPrice: number;
    totalDiscount: number;
    items: ItemTicket[];
    discounts: DiscountTicket[];
    totalPriceOriginal: number;
    totalTaxAmount: number;
  }> {
    const {
      bodyItems,
      items: dbItems,
      bodyItemVariants,
      itemVariants: dbItemVariants,
      discounts: dbDiscounts,
      modifiers: dbModifiers,
    } = await this._validateItemAnDiscountTickets(body);

    let itemTickets: ItemTicket[] = this._createItemTickets({
      bodyItems,
      dbItems,
      bodyItemVariants,
      dbItemVariants,
      dbDiscounts,
      dbModifiers,
    });

    let discountTickets: DiscountTicket[] = [];
    if (dbDiscounts.length) {
      for (const dbDiscount of dbDiscounts) {
        const discountTicket = this.discountTicketRepository.create({
          discountType: dbDiscount.type,
          discountName: dbDiscount.name,
          value: dbDiscount.value,
          code: dbDiscount.code,
          discount: dbDiscount,
        });

        discountTickets = [...discountTickets, discountTicket];
      }
    }

    // Calculate total price for ticket
    let totalPriceOriginal = 0;
    let totalDiscount = 0;
    let totalPrice = 0;
    let totalTaxAmount = 0;

    itemTickets = itemTickets.map((itemTicket) => {
      const price = itemTicket.modifiers.reduce((result, modifier) => {
        return result + modifier.price;
      }, itemTicket.price);
      const taxAmount = (price - price / (1 + itemTicket.tax / 100)) * itemTicket.quantity;

      totalPriceOriginal += itemTicket.price * itemTicket.quantity;
      totalDiscount += (price - itemTicket.discountedPrice) * itemTicket.quantity;
      totalTaxAmount += taxAmount;
      totalPrice += itemTicket.discountedPrice * itemTicket.quantity;

      itemTicket.price = convertNumberToFloat(itemTicket.price, this.companyConfig.decimalPlaces);
      itemTicket.discountedPrice = convertNumberToFloat(itemTicket.discountedPrice, this.companyConfig.decimalPlaces);

      return itemTicket;
    });

    totalDiscount = totalDiscount < 0 ? 0 : totalDiscount;

    return {
      totalDiscount,
      totalPrice,
      items: itemTickets,
      discounts: discountTickets,
      totalPriceOriginal,
      totalTaxAmount,
    };
  }

  async _validateItemAnDiscountTickets(body: { items: ItemTicketDto[]; discounts: string[] }): Promise<{
    bodyItems: ItemTicketDto[];
    items: Item[];
    bodyItemVariants: ItemTicketDto[];
    itemVariants: ItemVariant[];
    discounts: Discount[];
    modifiers: Modifier[];
  }> {
    const deletedItems: { id: string; name: string; variantName?: string; type: ItemTicketType }[] = [];

    const modifierIds: string[] = [];

    // Get Items From DB and validate
    const bodyItems: ItemTicketDto[] = body.items.filter((bodyItem) => bodyItem.type === ItemTicketType.Item);
    const bodyItemIds = [];
    bodyItems.forEach((item) => {
      if (bodyItemIds.includes(item.id)) {
        return;
      }
      bodyItemIds.push(item.id);
    });

    bodyItems.forEach((item) => {
      if (item.modifiers?.length) {
        item.modifiers.forEach((modifier) => {
          if (modifierIds.includes(modifier.modifierId)) {
            return;
          }
          modifierIds.push(modifier.modifierId);
        });
      }
    });
    const itemList: Item[] = await this.itemRepository.find({
      where: {
        id: In(bodyItemIds),
      },
      relations: { categories: true },
      withDeleted: true,
    });
    if (bodyItemIds.length !== itemList.length) {
      console.log('==== ITEM INVALID ====');
      console.log(bodyItemIds, itemList);
      throw new BadRequestException('Have Item Invalid');
    }

    bodyItems.map((bodyItem) => {
      const item = itemList.find((item) => item.id === bodyItem.id);

      if (item.deletedAt) {
        deletedItems.push({ id: item.id, name: item.name, type: ItemTicketType.Item, variantName: '' });
      }
    });
    // Get Item Variant From DB and validate
    const bodyItemVariants: ItemTicketDto[] = body.items.filter(
      (bodyItem) => bodyItem.type === ItemTicketType.ItemVariant,
    );
    const bodyItemVariantIds = [];
    bodyItemVariants.forEach((item) => {
      if (bodyItemVariantIds.includes(item.id)) {
        return;
      }
      bodyItemVariantIds.push(item.id);
    });

    bodyItemVariants.forEach((item) => {
      if (item.modifiers?.length) {
        item.modifiers.forEach((modifier) => {
          if (modifierIds.includes(modifier.modifierId)) {
            return;
          }
          modifierIds.push(modifier.modifierId);
        });
      }
    });
    const itemVariantList: ItemVariant[] = await this.itemVariantRepository.find({
      where: {
        id: In(bodyItemVariantIds),
      },
      withDeleted: true,
      relations: { item: { categories: true } },
    });
    if (bodyItemVariantIds.length !== itemVariantList.length) {
      console.log('==== ITEM VARIANT INVALID ====');
      console.log(bodyItemVariantIds, itemVariantList);
      throw new BadRequestException('Have Item Variant Invalid');
    }
    bodyItemVariants.map((bodyItem) => {
      const itemVariant = itemVariantList.find((item) => item.id === bodyItem.id);

      if (itemVariant.deletedAt) {
        deletedItems.push({
          id: itemVariant.id,
          name: itemVariant.item.name,
          type: ItemTicketType.ItemVariant,
          variantName: generateVariantName(itemVariant.options),
        });
      }
    });

    // Find Modifier
    const modifiers = await this.modifierRepository.find({
      where: {
        id: In(modifierIds),
      },
    });

    if (modifiers.length !== modifiers.length) {
      console.log('==== MODIFIER INVALID ====');
      console.log(modifiers, modifiers);
      throw new BadRequestException('Have Modifier is invalid');
    }

    // Get Discount From DB and valdiate
    const deletedDiscounts: Discount[] = [];
    let discounts: Discount[] = [];
    if (body.discounts?.length) {
      discounts = await this.discountsRepository.find({ where: { id: In(body.discounts) }, withDeleted: true });

      if (discounts.length !== body.discounts.length) {
        throw new BadRequestException('Discount value is invalid');
      }

      discounts.map((discount) => {
        if (discount.deletedAt) {
          deletedDiscounts.push({ ...discount });
        }
      });
    }

    if (deletedItems.length || deletedDiscounts.length) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        data: {
          deletedItems,
          deletedDiscounts,
        },
        message: 'Have item or discount was deleted',
      });
    }

    return {
      modifiers,
      bodyItems,
      items: itemList,
      bodyItemVariants,
      itemVariants: itemVariantList,
      discounts,
    };
  }

  _createItemTickets(data: {
    bodyItems: ItemTicketDto[];
    dbItems: Item[];
    bodyItemVariants: ItemTicketDto[];
    dbItemVariants: ItemVariant[];
    dbDiscounts: Discount[];
    dbModifiers: Modifier[];
  }): ItemTicket[] {
    const { bodyItems, dbItems, bodyItemVariants, dbItemVariants, dbDiscounts, dbModifiers } = data;
    let itemTickets: ItemTicket[] = [];

    bodyItems.map((bodyItem) => {
      const item = dbItems.find((item) => item.id === bodyItem.id);

      let optionPrice = 0;
      let modifiers = [];
      if (bodyItem.modifiers?.length) {
        bodyItem.modifiers.forEach((modifier) => {
          const dbModifier = dbModifiers.find((m) => m.id === modifier.modifierId);

          modifiers = [
            ...modifiers,
            this.itemTicketModifierRepository.create({
              modifierId: dbModifier.id,
              modifierName: dbModifier.name,
              optionName: modifier.optionName,
              price: modifier.price,
            }),
          ];

          optionPrice += modifier.price;
        });
      }

      const itemTicket = this.itemTicketRepository.create({
        itemId: bodyItem.id,
        itemType: bodyItem.type,
        quantity: bodyItem.quantity,
        price: bodyItem.amount || item.price || 0,
        discountedPrice: (bodyItem.amount || item.price || 0) + optionPrice,
        itemName: item.name,
        tax: item.categories.length ? item.categories[0].tax : 0,
        modifiers,
      });

      itemTickets = [...itemTickets, itemTicket];
    });

    // Create Item Tickets
    bodyItemVariants.map((bodyItem) => {
      const itemVariant = dbItemVariants.find((item) => item.id === bodyItem.id);

      let optionPrice = 0;
      let modifiers = [];
      if (bodyItem.modifiers?.length) {
        bodyItem.modifiers.forEach((modifier) => {
          const dbModifier = dbModifiers.find((m) => m.id === modifier.modifierId);

          modifiers = [
            ...modifiers,
            this.itemTicketModifierRepository.create({
              modifierId: dbModifier.id,
              modifierName: dbModifier.name,
              optionName: modifier.optionName,
              price: modifier.price,
            }),
          ];

          optionPrice += modifier.price;
        });
      }

      const itemTicket = this.itemTicketRepository.create({
        itemId: bodyItem.id,
        itemType: bodyItem.type,
        quantity: bodyItem.quantity,
        price: bodyItem.amount || itemVariant.price || 0,
        discountedPrice: (bodyItem.amount || itemVariant.price || 0) + optionPrice,
        itemName: itemVariant.item.name,
        options: itemVariant.options,
        tax: itemVariant.item.categories.length ? itemVariant.item.categories[0].tax : 0,
        modifiers,
      });

      itemTickets = [...itemTickets, itemTicket];
    });

    // Apply Discount to Item Tickets
    if (dbDiscounts.length) {
      const minPrice = Math.min(
        ...itemTickets.map((item) =>
          item.modifiers.reduce((result, modifier) => {
            return result + modifier.price;
          }, item.price),
        ),
      );
      const ratioPrice = itemTickets.reduce((result, item) => {
        const price = item.modifiers.reduce((resultPrice, modifier) => {
          return resultPrice + modifier.price;
        }, item.price);
        const itemRatio = (price / minPrice) * item.quantity;

        return result + itemRatio;
      }, 0);

      itemTickets = itemTickets.map((item) => {
        let totalAmountDiscount = 0;
        let totalPercentDiscount = 0;

        dbDiscounts.map((dbDiscount) => {
          if (dbDiscount.type === DiscountType.Amount) {
            totalAmountDiscount += dbDiscount.value;
          } else {
            totalPercentDiscount +=
              ((item.modifiers.reduce((result, modifier) => {
                return result + modifier.price;
              }, item.price) -
                totalPercentDiscount) /
                100) *
              dbDiscount.value;
          }
        });

        if (totalAmountDiscount > 0) {
          item.discountedPrice =
            item.discountedPrice - (totalAmountDiscount / ratioPrice) * (item.discountedPrice / minPrice);
        }

        item.discountedPrice = item.discountedPrice - totalPercentDiscount;

        return item;
      });
    }

    return itemTickets;
  }

  async find({
    page = 0,
    pageSize = 10,
    order = 'asc',
    sort = 'createdAt',
    search,
    shiftId,
    userId,
    paymentStatus,
  }: FindTicketDto) {
    let where: FindOptionsWhere<Ticket> | FindOptionsWhere<Ticket>[] = {
      ...(paymentStatus && {
        paymentStatus,
      }),
      ...(shiftId && {
        shift: {
          id: shiftId,
        },
      }),
      ...(userId && {
        user: {
          id: userId,
        },
      }),
    };

    if (search) {
      where = [
        {
          ...where,
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
        {
          ...where,
          ticketNumber: Number.parseInt(search.trim().toLowerCase()),
        },
      ];
    }

    const [data, total] = await this.ticketRepository.findAndCount({
      where,
      relations: {
        refundedTicket: true,
        discountTickets: { discount: true },
        shift: true,
        user: true,
        receipts: true,
        itemTickets: { modifiers: true },
      },
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    const responseData: TicketData[] = await Promise.all(
      data.map(async (ticket) => {
        let items = [];
        if (ticket.itemTickets.length) {
          items = await this._getItemDetailFromTicket(ticket.itemTickets);
        }

        let discountTickets = [];
        if (ticket.discountTickets.length) {
          const discountIds = ticket.discountTickets.map((discountTicket) => discountTicket.discount.id);

          const dbDiscounts = await this.discountsRepository.find({
            where: { id: In(discountIds) },
            withDeleted: true,
          });

          discountTickets = ticket.discountTickets.map((discountTicket) => {
            const dbDiscount = dbDiscounts.find((dbDis) => dbDis.id === discountTicket.discount.id);

            return new DiscountTicketData({
              ...discountTicket,
              discountId: dbDiscount.id,
              deletedAt: dbDiscount.deletedAt,
            });
          });
        }

        let totalCash = 0;
        let differentAmount = 0;

        ticket.receipts.forEach((receipt) => {
          totalCash += receipt.totalPrice;
          differentAmount += receipt.differentAmount;
        });

        const refunded =
          ticket.ticketType === TicketType.Order &&
          ticket.itemTickets.find((itemTicket) => itemTicket.quantity !== itemTicket.refundedQuantity) == null;

        let taxList: { name: string; amount: number }[] = [];
        ticket.itemTickets.forEach((itemTicket) => {
          if (itemTicket.tax) {
            const price = itemTicket.modifiers.reduce((result, modifier) => {
              return result + modifier.price;
            }, itemTicket.price);

            const taxValue = (price - price / (1 + itemTicket.tax / 100)) * itemTicket.quantity;
            const taxInList = taxList.find((tax) => tax.name === itemTicket.tax.toString() + '%');
            if (!taxInList) {
              taxList.push({
                name: itemTicket.tax.toString() + '%',
                amount: convertNumberToFloat(taxValue, this.companyConfig.decimalPlaces),
              });
            } else {
              taxList = taxList.map((tax) => {
                if (tax.name === itemTicket.tax.toString() + '%') {
                  tax.amount += convertNumberToFloat(taxValue, this.companyConfig.decimalPlaces);
                }

                return tax;
              });
            }
          }
        });

        const m: TicketData = new TicketData({
          ...ticket,
          refundedTicketId: ticket.refundedTicket?.id,
          discountTickets,
          refunded,
          itemTickets: items,
          totalCash,
          differentAmount,
          taxList,
        });
        return m;
      }),
    );

    return { data: responseData, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async findOne({ id }: { id: string }) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        shift: true,
        itemTickets: { modifiers: true },
        discountTickets: { discount: true },
        user: true,
        receipts: true,
      },
    });

    if (!ticket) {
      throw new BadRequestException('Ticket Not Found');
    }

    let items = [];
    if (ticket.itemTickets.length) {
      items = await this._getItemDetailFromTicket(ticket.itemTickets);
    }

    let discountTickets = [];
    if (ticket.discountTickets.length) {
      const discountIds = ticket.discountTickets.map((discountTicket) => discountTicket.discount.id);

      const dbDiscounts = await this.discountsRepository.find({ where: { id: In(discountIds) }, withDeleted: true });

      discountTickets = ticket.discountTickets.map((discountTicket) => {
        const dbDiscount = dbDiscounts.find((dbDis) => dbDis.id === discountTicket.discount.id);

        return new DiscountTicketData({
          ...discountTicket,
          discountId: dbDiscount.id,
          deletedAt: dbDiscount.deletedAt,
        });
      });
    }

    let totalCash = 0;
    let differentAmount = 0;

    ticket.receipts.forEach((receipt) => {
      totalCash += receipt.totalPrice;
      differentAmount += receipt.differentAmount;
    });

    const refunded =
      ticket.ticketType === TicketType.Order &&
      ticket.itemTickets.find((itemTicket) => itemTicket.quantity !== itemTicket.refundedQuantity) == null;

    let taxList: { name: string; amount: number }[] = [];
    ticket.itemTickets.forEach((itemTicket) => {
      if (itemTicket.tax) {
        const price = itemTicket.modifiers.reduce((result, modifier) => {
          return result + modifier.price;
        }, itemTicket.price);

        const taxValue = (price - price / (1 + itemTicket.tax / 100)) * itemTicket.quantity;
        const taxInList = taxList.find((tax) => tax.name === itemTicket.tax.toString() + '%');
        if (!taxInList) {
          taxList.push({
            name: itemTicket.tax.toString() + '%',
            amount: convertNumberToFloat(taxValue, this.companyConfig.decimalPlaces),
          });
        } else {
          taxList = taxList.map((tax) => {
            if (tax.name === itemTicket.tax.toString() + '%') {
              tax.amount += convertNumberToFloat(taxValue, this.companyConfig.decimalPlaces);
            }

            return tax;
          });
        }
      }
    });

    return new TicketData({
      ...ticket,
      itemTickets: items,
      discountTickets: discountTickets,
      totalCash,
      differentAmount,
      refunded,
      taxList,
    });
  }

  async _getItemDetailFromTicket(itemTicketList: ItemTicket[]): Promise<ItemTicketData[]> {
    const itemTickets = itemTicketList.filter((item) => item.itemType === ItemTicketType.Item);
    const itemIds = itemTickets.map((item) => item.itemId);

    const variantTickets = itemTicketList.filter((item) => item.itemType === ItemTicketType.ItemVariant);
    const variantIds = variantTickets.map((item) => item.itemId);

    let itemTicketData = [];

    if (itemIds.length) {
      const items = await this.itemRepository.find({ where: { id: In(itemIds) }, withDeleted: true });

      itemTicketData = [
        ...itemTicketData,
        ...itemTickets.map((itemTicket) => {
          const dbItem = items.find((item) => item.id === itemTicket.itemId);

          return new ItemTicketData({
            ...itemTicket,
            deletedAt: dbItem.deletedAt,
            refunded: itemTicket.refundedQuantity === itemTicket.quantity,
          });
        }),
      ];
    }

    if (variantIds.length) {
      const itemVariants = await this.itemVariantRepository.find({
        where: { id: In(variantIds) },
        withDeleted: true,
        relations: { item: true },
      });

      itemTicketData = [
        ...itemTicketData,
        ...variantTickets.map((itemTicket) => {
          const dbItem = itemVariants.find((item) => item.id === itemTicket.itemId);

          return new ItemTicketData({
            ...itemTicket,
            deletedAt: dbItem.deletedAt,
            refunded: itemTicket.refundedQuantity === itemTicket.quantity,
          });
        }),
      ];
    }

    return itemTicketData;
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const localTicketRepo = queryRunner.manager.getRepository(Ticket);
    const localReceiptRepo = queryRunner.manager.getRepository(Receipt);
    const localItemTicketRepo = queryRunner.manager.getRepository(ItemTicket);
    const localDiscountTicketRepo = queryRunner.manager.getRepository(DiscountTicket);
    const itemTicketModifierRepository = queryRunner.manager.getRepository(ItemTicketModifier);

    try {
      const ticket = await localTicketRepo.findOne({
        where: { id },
        relations: { receipts: true, itemTickets: true, discountTickets: true },
      });

      if (!ticket) {
        throw new BadRequestException('Ticket Not Found');
      }

      if (ticket.paymentStatus !== PaymentStatus.Waiting) {
        throw new BadRequestException('Can not delete by ticket complete charged');
      }

      await Promise.all([
        localReceiptRepo.remove(ticket.receipts),
        itemTicketModifierRepository.delete({
          itemTicket: {
            id: In(ticket.itemTickets.map((i) => i.id)),
          },
        }),
        localItemTicketRepo.remove(ticket.itemTickets),
        localDiscountTicketRepo.remove(ticket.discountTickets),
        localTicketRepo.remove(ticket),
      ]);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      console.log(`${new Date().toString()} 🚀 ~ file: ticket.service.ts ~ TicketService ~ delete ~ error:`, e);

      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async sendMail({ email, ticketId }: SendEmailDto) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: { itemTickets: { modifiers: true }, discountTickets: true, receipts: true, user: true },
    });

    if (!ticket || ticket.paymentStatus !== PaymentStatus.Completed) {
      throw new BadRequestException('Ticket not found');
    }

    const employee = await this.userRepository.findOne({ where: { id: ticket.user.userId } });
    let company = null;
    let companyConfig = null;
    if (employee) {
      company = await this.companyRepository.findOne({ where: { id: employee.companyId } });
      companyConfig = await this.companyConfigRepository.findOne({ where: { company: { id: employee.companyId } } });
    }

    await this.receiptRepository.update(
      {
        ticket: {
          id: ticketId,
        },
      },
      {
        email,
      },
    );

    await this.mailService.sendTicketReceiptMail({
      ticket: ticket,
      itemTickets: ticket.itemTickets,
      discountTickets: ticket.discountTickets,
      email,
      employee,
      company,
      companyConfig,
      receipts: ticket.receipts,
    });
  }

  async clearTicketItem({ ticketId }: { ticketId: string }) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: { itemTickets: true, discountTickets: true, receipts: true, user: true },
    });

    if (!ticket) {
      throw new BadRequestException('Not Found');
    }

    if (ticket.paymentStatus !== PaymentStatus.Waiting) {
      throw new BadRequestException('Only for Waiting ticket');
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const itemTicketRepository = queryRunner.manager.getRepository(ItemTicket);
    const itemTicketModifierRepository = queryRunner.manager.getRepository(ItemTicketModifier);

    const ticketRepository = queryRunner.manager.getRepository(Ticket);

    try {
      await Promise.all([
        itemTicketModifierRepository.delete({
          itemTicket: {
            id: In(ticket.itemTickets.map((i) => i.id)),
          },
        }),
        itemTicketRepository.delete({
          id: In(ticket.itemTickets.map((i) => i.id)),
        }),
        ticketRepository.update(
          {
            id: ticketId,
          },
          {
            totalPrice: 0,
            totalPriceOriginal: 0,
            totalTaxAmount: 0,
            totalDiscount: 0,
            ticketNumber: 0,
            // totalAmount: 0,
            // totalCash: 0,
            // differentAmount: 0,
          },
        ),
      ]);

      await queryRunner.commitTransaction();

      return await this.findOne({ id: ticketId });
    } catch (e) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: ticket.service.ts:779 ~ TicketService ~ clearTicketItem ~ e:`,
        e,
      );
      await queryRunner.rollbackTransaction();

      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
