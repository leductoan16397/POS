import { BadRequestException, HttpStatus, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment-timezone';
import { DiscountType } from 'src/common/enum';
import { LoggedUser } from 'src/common/type';
import { convertNumberToFloat } from 'src/common/utils';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Company } from 'src/module/public/company/entity/company.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { And, DataSource, In, LessThanOrEqual, MoreThanOrEqual, QueryRunner, Repository } from 'typeorm';
import { Discount } from '../discount/entity/discount.entity';
import { Item } from '../item/entity/item.entity';
import { ItemVariant } from '../item/entity/item.variant.entity';
import { Modifier } from '../modifier/entity/modifier.entity';
import { ItemTicketDto } from './dto/ticket.dto';
import { MergeTicketsDto, ReportTicketDto, SplitTicketsDto } from './dto/ticket.handler.dto';
import { DiscountTicket } from './entity/discount.ticket.entity';
import { ItemTicket } from './entity/item.ticket.entity';
import { ItemTicketModifier } from './entity/item.ticket.modifier.entity';
import { Ticket } from './entity/ticket.entity';
import { DiscountTicketData } from './response/discount.ticket.res';
import { ItemTicketData } from './response/item.ticket.res';
import { TicketData } from './response/ticket.res';
import { ItemTicketType, PaymentStatus, TicketType } from './utils/enum';
import { generateVariantName } from './utils/helper';
import { CompanyConfig } from '../../public/company_config/entity/company.config.entity';

@Injectable()
export class TicketHandlerService {
  private readonly connection: DataSource;
  private readonly ticketRepository: Repository<Ticket>;
  private readonly itemTicketRepository: Repository<ItemTicket>;
  private readonly discountTicketRepository: Repository<DiscountTicket>;
  private readonly itemRepository: Repository<Item>;
  private readonly companyConfig: CompanyConfig;

  constructor(
    @Inject(CONNECTION)
    connection: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @Inject(COMPANY_CONFIG) companyConfig: CompanyConfig,
  ) {
    this.connection = connection;
    this.ticketRepository = connection.getRepository(Ticket);
    this.itemTicketRepository = connection.getRepository(ItemTicket);
    this.itemRepository = connection.getRepository(Item);
    this.discountTicketRepository = connection.getRepository(DiscountTicket);

    this.companyConfig = companyConfig;
  }

  async mergeTickets(body: MergeTicketsDto) {
    const ticketIds = body.ticketIds.filter((e) => e !== body.mergeTicketId);

    const mergedTickets = await this.ticketRepository.find({
      where: { id: In(ticketIds) },
      withDeleted: true,
      relations: { receipts: true, itemTickets: { modifiers: true }, discountTickets: { discount: true } },
    });

    const ticket = await this.ticketRepository.findOne({
      where: { id: body.mergeTicketId },
      withDeleted: true,
      relations: { receipts: true, itemTickets: { modifiers: true }, discountTickets: { discount: true } },
    });

    if (ticket.receipts.length || mergedTickets.filter((ti) => ti.receipts.length).length) {
      throw new BadRequestException('Have ticket is in payment process');
    }

    let itemTickets: ItemTicket[] = [
      ...ticket.itemTickets.map((item) => {
        const price = item.modifiers.reduce((resultPrice, modifier) => {
          return resultPrice + modifier.price;
        }, item.price);

        item.discountedPrice = price;
        return item;
      }),
    ];
    const discountTickets: DiscountTicket[] = [...ticket.discountTickets];

    for (const mergeTicket of mergedTickets) {
      itemTickets = [
        ...itemTickets,
        ...mergeTicket.itemTickets.map((itemTicket) => {
          const price = itemTicket.modifiers.reduce((resultPrice, modifier) => {
            return resultPrice + modifier.price;
          }, itemTicket.price);
          return this.itemTicketRepository.create({
            ...itemTicket,
            discountedPrice: price,
            ticket: ticket,
          });
        }),
      ];

      mergeTicket.discountTickets.forEach((mergedDiscountTicket) => {
        const findDiscount = discountTickets.find((dt) => dt.discount.id === mergedDiscountTicket.discount.id);
        if (findDiscount === null || findDiscount === undefined) {
          discountTickets.push(
            this.discountTicketRepository.create({
              ...mergedDiscountTicket,
              ticket: ticket,
            }),
          );
        }
      });
    }

    // Recalculate item tickets with discount
    if (discountTickets.length) {
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

        discountTickets.map((discountTicket) => {
          if (discountTicket.discountType === DiscountType.Amount) {
            totalAmountDiscount += discountTicket.value;
          } else {
            totalPercentDiscount +=
              ((item.modifiers.reduce((result, modifier) => {
                return result + modifier.price;
              }, item.price) -
                totalPercentDiscount) /
                100) *
              discountTicket.value;
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

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const localTicketRepo = queryRunner.manager.getRepository(Ticket);
    const localDiscountTicketRepo = queryRunner.manager.getRepository(DiscountTicket);

    try {
      await localTicketRepo.save({
        ...ticket,
        itemTickets,
        discountTickets,
        totalPrice,
        totalPriceOriginal,
        totalDiscount,
        totalTaxAmount,
      });

      await localDiscountTicketRepo.delete({ ticket: { id: In(ticketIds) } });
      await localTicketRepo.delete({ id: In(ticketIds) });

      const newTicket = await localTicketRepo.findOne({
        where: { id: ticket.id },
        relations: { itemTickets: true, discountTickets: true },
      });

      await queryRunner.commitTransaction();

      return new TicketData({
        ...newTicket,
        itemTickets: newTicket.itemTickets.map((item) => new ItemTicketData({ ...item })),
        discountTickets: newTicket.discountTickets.map((item) => new DiscountTicketData({ ...item })),
      });
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async reportData({ loggedUser, query }: { loggedUser: LoggedUser; query: ReportTicketDto }) {
    const { from, to } = query;

    if (from && to && from > to) {
      throw new BadRequestException('"to" must be after "from"');
    }

    if (!from && to) {
      throw new BadRequestException('"from" must be a Date instance');
    }

    const user = await this.userRepository.findOne({ where: { id: loggedUser.id } });
    const company = await this.companyRepository.findOne({
      where: {
        id: user.companyId,
      },
      relations: {
        config: true,
      },
    });

    const startDate = from ? moment(from) : moment().tz(company.config.timezone).startOf('D');

    const endDate = to ? moment(to) : moment().tz(company.config.timezone).endOf('d');

    const completedTickets = await this.ticketRepository.find({
      where: {
        createdAt: And(MoreThanOrEqual(startDate.toDate()), LessThanOrEqual(endDate.toDate())),
        paymentStatus: PaymentStatus.Completed,
      },
      relations: {
        user: true,
        itemTickets: { modifiers: true },
        receipts: true,
        discountTickets: true,
      },
    });

    const itemIds = completedTickets.reduce((result, ticket) => {
      return [
        ...result,
        ...ticket.itemTickets.map((itemTicket) => {
          return itemTicket.itemId;
        }),
      ];
    }, []);

    const items = await this.itemRepository.find({ where: { id: In(itemIds) }, withDeleted: true });

    let grossSales = 0;
    let refunds = 0;
    let discounts = 0;
    let tax = 0;
    let costOfGoods = 0;
    let receiptCount = 0;

    completedTickets.forEach((ticket) => {
      if (ticket.ticketType === TicketType.Order) {
        grossSales += ticket.totalPrice;
        discounts += ticket.totalDiscount;
        tax += ticket.totalTaxAmount;
        receiptCount += ticket.receipts.length;
      } else {
        refunds += ticket.totalPrice;
      }

      costOfGoods += ticket.itemTickets.reduce((result, itemTicket) => {
        const item = items.find((item) => item.id === itemTicket.itemId);

        if (item) {
          return result + (item.cost ?? 0) * itemTicket.quantity;
        }

        return result;
      }, 0);
    });

    const netSales = grossSales - refunds;
    const grossProfit = netSales - costOfGoods;

    return {
      grossSales: convertNumberToFloat(grossSales + discounts, this.companyConfig.decimalPlaces),
      refunds: convertNumberToFloat(refunds, this.companyConfig.decimalPlaces),
      discounts: convertNumberToFloat(discounts, this.companyConfig.decimalPlaces),
      costOfGoods: convertNumberToFloat(costOfGoods, this.companyConfig.decimalPlaces),
      tax: convertNumberToFloat(tax, this.companyConfig.decimalPlaces),
      receiptCount,
      netSales: convertNumberToFloat(netSales, this.companyConfig.decimalPlaces),
      grossProfit: convertNumberToFloat(grossProfit, this.companyConfig.decimalPlaces),
    };
  }

  async splitTicket(body: SplitTicketsDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const localTicketRepository = queryRunner.manager.getRepository(Ticket);
      const localItemTicketRepo = queryRunner.manager.getRepository(ItemTicket);
      const localDiscountTicketRepository = queryRunner.manager.getRepository(DiscountTicket);
      const localItemTicketModifierRepo = queryRunner.manager.getRepository(ItemTicketModifier);

      const ticket = await localTicketRepository.findOne({
        where: { id: body.ticketId },
        relations: { customer: true, shift: true, user: true, itemTickets: true },
      });

      if (!ticket || ticket.receipts || ticket.paymentStatus === PaymentStatus.Completed) {
        throw new BadRequestException('Can not find ticket or invalid');
      }

      const itemTicketIds = ticket.itemTickets.map((itemTicket) => itemTicket.id);

      await localItemTicketModifierRepo.delete({ itemTicket: { id: In(itemTicketIds) } });
      await localItemTicketRepo.delete({ ticket: { id: body.ticketId } });
      await localDiscountTicketRepository.delete({ ticket: { id: body.ticketId } });

      const newTickets = [];

      for (const data of body.data) {
        const index = body.data.indexOf(data);
        const {
          totalPrice,
          totalDiscount,
          items,
          discounts: updatedDiscount,
          totalPriceOriginal,
          totalTaxAmount,
        } = await this._calculateTicket({ items: data.items, discounts: data?.discounts ?? [], queryRunner });

        if (convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces) !== data.totalAmount) {
          throw new BadRequestException({
            message: 'Total Amount is not correct!',
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST,
            correctTotal: convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces),
          });
        }

        let newTicketData;

        if (index === 0) {
          newTicketData = { ...newTicketData, id: ticket.id };
        } else {
          newTicketData = {
            ...body,
            totalPrice: convertNumberToFloat(totalPrice, this.companyConfig.decimalPlaces),
            totalDiscount: convertNumberToFloat(totalDiscount, this.companyConfig.decimalPlaces),
            customer: ticket.customer,
            shift: ticket.shift,
            itemTickets: items,
            discountTickets: updatedDiscount,
            user: ticket.user,
            totalPriceOriginal: convertNumberToFloat(totalPriceOriginal, this.companyConfig.decimalPlaces),
            totalTaxAmount: convertNumberToFloat(totalTaxAmount, this.companyConfig.decimalPlaces),
          };
        }

        const newTicket = localTicketRepository.create(newTicketData);

        newTickets.push(newTicket);
      }

      await localTicketRepository.save(newTickets);

      await queryRunner.commitTransaction();

      return { message: 'Split ticket successfully' };
    } catch (e) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: ticket.handler.service.ts ~ TicketHandlerService ~ splitTicket ~ e:`,
        e,
      );
      await queryRunner.rollbackTransaction();

      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async _calculateTicket(body: { items: ItemTicketDto[]; discounts: string[]; queryRunner: QueryRunner }): Promise<{
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
      queryRunner: body.queryRunner,
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

  async _validateItemAnDiscountTickets(body: {
    items: ItemTicketDto[];
    discounts: string[];
    queryRunner: QueryRunner;
  }): Promise<{
    bodyItems: ItemTicketDto[];
    items: Item[];
    bodyItemVariants: ItemTicketDto[];
    itemVariants: ItemVariant[];
    discounts: Discount[];
    modifiers: Modifier[];
  }> {
    const itemVariantRepository = body.queryRunner.manager.getRepository(ItemVariant);
    const modifierRepository = body.queryRunner.manager.getRepository(Modifier);
    const discountsRepository = body.queryRunner.manager.getRepository(Discount);

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
      if (bodyItemIds.includes(item.id)) {
        return;
      }
      bodyItemVariantIds.push(item.id);

      if (item.modifiers?.length) {
        item.modifiers.forEach((modifier) => {
          if (modifierIds.includes(modifier.modifierId)) {
            return;
          }
          modifierIds.push(modifier.modifierId);
        });
      }
    });
    const itemVariantList: ItemVariant[] = await itemVariantRepository.find({
      where: {
        id: In(bodyItemVariantIds),
      },
      withDeleted: true,
      relations: { item: { categories: true } },
    });
    if (bodyItemVariantIds.length !== itemVariantList.length) {
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
    const modifiers = await modifierRepository.find({
      where: {
        id: In(modifierIds),
      },
    });

    if (modifiers.length !== modifierIds.length) {
      throw new BadRequestException('Have Modifier is invalid');
    }

    // Get Discount From DB and valdiate
    const deletedDiscounts: Discount[] = [];
    let discounts: Discount[] = [];
    if (body.discounts?.length) {
      discounts = await discountsRepository.find({ where: { id: In(body.discounts) }, withDeleted: true });

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
        mesage: 'Have item or discount was deleted',
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
    queryRunner: QueryRunner;
  }): ItemTicket[] {
    const itemTicketModifierRepository = data.queryRunner.manager.getRepository(ItemTicketModifier);
    const itemTicketRepository = data.queryRunner.manager.getRepository(ItemTicket);

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
            itemTicketModifierRepository.create({
              modifierId: dbModifier.id,
              modifierName: dbModifier.name,
              optionName: modifier.optionName,
              price: modifier.price,
            }),
          ];

          optionPrice += modifier.price;
        });
      }

      const itemTicket = itemTicketRepository.create({
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
            itemTicketModifierRepository.create({
              modifierId: dbModifier.id,
              modifierName: dbModifier.name,
              optionName: modifier.optionName,
              price: modifier.price,
            }),
          ];

          optionPrice += modifier.price;
        });
      }

      const itemTicket = itemTicketRepository.create({
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
              ((item.modifiers.reduce((result, modifier) => result + modifier.price, item.price) -
                totalPercentDiscount) /
                100) *
              dbDiscount.value;
          }
        });

        if (totalAmountDiscount > 0) {
          item.discountedPrice = item.price - (totalAmountDiscount / ratioPrice) * (item.price / minPrice);
        }

        item.discountedPrice = item.discountedPrice - totalPercentDiscount;
        item.discountedPrice = item.discountedPrice > 0 ? item.discountedPrice : 0;

        return item;
      });
    }

    return itemTickets;
  }
}
