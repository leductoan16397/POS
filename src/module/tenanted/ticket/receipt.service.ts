import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggedUser } from 'src/common/type';
import { convertNumberToFloat } from 'src/common/utils';
import { MailService } from 'src/module/common/mail/mail.service';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Company } from 'src/module/public/company/entity/company.entity';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Shift } from '../shift/entity/shift.entity';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { CompleteReceiptDto, CreateReceiptDto, DeleteReceiptDto, RefundReceiptDto } from './dto/receipt.dto';
import { RefundTicketDto } from './dto/ticket.dto';
import { ItemTicket } from './entity/item.ticket.entity';
import { ItemTicketModifier } from './entity/item.ticket.modifier.entity';
import { Receipt } from './entity/receipt.entity';
import { Ticket } from './entity/ticket.entity';
import { ItemTicketData } from './response/item.ticket.res';
import { ReceiptData } from './response/receipt.res';
import { TicketData } from './response/ticket.res';
import { PaymentStatus, PaymentType, TicketType } from './utils/enum';
import { RefundItemTicketInfo } from './utils/type';
import { DiscountTicket } from './entity/discount.ticket.entity';
import { DiscountTicketData } from './response/discount.ticket.res';

@Injectable()
export class ReceiptService {
  private readonly connection: DataSource;

  private readonly receiptRepository: Repository<Receipt>;
  private readonly ticketRepository: Repository<Ticket>;
  private readonly tenantUserRepository: Repository<TenantUser>;

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

    this.receiptRepository = connection.getRepository(Receipt);
    this.ticketRepository = connection.getRepository(Ticket);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.companyConfig = companyConfig;
  }

  async store(body: CreateReceiptDto): Promise<ReceiptData> {
    console.log(`${new Date().toString()} 🚀 ~ file: receipt.service.ts:48 ~ ReceiptService ~ store ~ body:`, body);
    const ticket = await this.ticketRepository.findOne({ where: { id: body.ticket }, relations: { shift: true } });

    console.log(`${new Date().toString()} 🚀 ~ file: receipt.service.ts:51 ~ ReceiptService ~ store ~ ticket:`, ticket);
    if (!ticket || ticket.paymentStatus === PaymentStatus.Completed || ticket.ticketType === TicketType.Refund) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: receipt.service.ts:51 ~ ReceiptService ~ store ~ ticket.ticketType:`,
        ticket.ticketType,
      );
      console.log(
        `${new Date().toString()} 🚀 ~ file: receipt.service.ts:51 ~ ReceiptService ~ store ~ ticket.paymentStatus:`,
        ticket.paymentStatus,
      );
      throw new BadRequestException('Ticket is invalid or Paid');
    }

    const ticketTotalPrice = ticket.totalPrice < 0 ? 0 : ticket.totalPrice;

    if (body.totalCash > ticketTotalPrice && body.paymentType !== PaymentType.Cash) {
      throw new BadRequestException('Total price is invalid');
    }

    const ticketReceipts = await this.receiptRepository.find({
      where: { ticket: { id: body.ticket } },
      relations: { ticket: true },
    });

    const paidPrice = ticketReceipts.reduce((result, ticketReipt) => {
      return result + ticketReipt.totalPrice;
    }, 0);

    if (ticketTotalPrice - paidPrice < body.totalCash && body.paymentType !== PaymentType.Cash) {
      throw new BadRequestException('Total Price is too much!');
    }

    let status = PaymentStatus.Completed;
    if (body.totalCash < ticketTotalPrice) {
      throw new BadRequestException('Total Cash is invalid');
    }
    let differentAmount = body.totalCash - ticketTotalPrice;
    if (body.paymentType === PaymentType.Cash) {
      if (body.totalCash < ticketTotalPrice) {
        status = PaymentStatus.Waiting;
      } else {
        differentAmount = body.totalCash - (ticketTotalPrice - paidPrice);
      }
    } else {
      status = PaymentStatus.Pending;
    }

    let receipt = this.receiptRepository.create({
      ...body,
      totalPrice: body.totalCash,
      paymentStatus: status,
      differentAmount,
      ticket,
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const localReceiptRepo = queryRunner.manager.getRepository(Receipt);
    const localTicketRepo = queryRunner.manager.getRepository(Ticket);
    const localShiftRepo = queryRunner.manager.getRepository(Shift);

    try {
      receipt = await localReceiptRepo.save(receipt);

      await localTicketRepo.save({
        id: ticket.id,
        email: body.email,
        paymentStatus: status,
      });

      if (ticket.shift && status === PaymentStatus.Completed) {
        const shiftData =
          receipt.paymentType === PaymentType.Card
            ? {
                totalCard: convertNumberToFloat(
                  ticket.shift.totalCard + receipt.totalPrice,
                  this.companyConfig.decimalPlaces,
                ),
                totalDiscount: convertNumberToFloat(
                  ticket.shift.totalDiscount + ticket.totalDiscount,
                  this.companyConfig.decimalPlaces,
                ),
              }
            : {
                totalCash: convertNumberToFloat(
                  ticket.shift.totalCash + receipt.totalPrice - receipt.differentAmount,
                  this.companyConfig.decimalPlaces,
                ),
                totalDiscount: convertNumberToFloat(
                  ticket.shift.totalDiscount + ticket.totalDiscount,
                  this.companyConfig.decimalPlaces,
                ),
              };

        await localShiftRepo.save({
          id: ticket.shift.id,
          ...shiftData,
        });
      }

      receipt = await localReceiptRepo.findOne({
        where: { id: receipt.id },
        relations: { ticket: { shift: true } },
      });

      await queryRunner.commitTransaction();

      return new ReceiptData(receipt);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: receipt.service.ts ~ ReceiptService::store ~ error:`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async complete(data: CompleteReceiptDto): Promise<void> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: data.ticket },
      relations: { shift: true, receipts: true },
    });

    if (!ticket) {
      throw new BadRequestException('Ticket Not Found');
    }

    const receipts = ticket.receipts;
    let totalCash = 0;
    let totalCard = 0;

    for (const receipt of receipts) {
      if (receipt.paymentType === PaymentType.Card) {
        totalCard += receipt.totalPrice;
      } else {
        totalCash += receipt.totalPrice - receipt.differentAmount;
      }
    }

    if (totalCard + totalCash !== ticket.totalPrice) {
      throw new BadRequestException('Total Price of receipt and ticket not same');
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const localShiftRepo = queryRunner.manager.getRepository(Shift);
    const localTicketRepo = queryRunner.manager.getRepository(Ticket);
    const localReceiptRepo = queryRunner.manager.getRepository(Receipt);

    try {
      if (ticket.shift) {
        const shift = ticket.shift;
        shift.totalCard = convertNumberToFloat(shift.totalCard + totalCard, this.companyConfig.decimalPlaces);
        shift.totalCash = convertNumberToFloat(shift.totalCash + totalCash, this.companyConfig.decimalPlaces);
        shift.totalDiscount = convertNumberToFloat(
          shift.totalDiscount + ticket.totalDiscount,
          this.companyConfig.decimalPlaces,
        );

        await localShiftRepo.save(shift);
      }

      await localTicketRepo.save({
        id: ticket.id,
        email: data.email,
        paymentStatus: PaymentStatus.Completed,
      });

      await localReceiptRepo.update({ ticket: { id: data.ticket } }, { paymentStatus: PaymentStatus.Completed });

      if (data.email && data.email !== '') {
        this.sendMail({ email: data.email, ticketId: data.ticket });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: receipt.service.ts ~ ReceiptService::complete ~ error:`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refund(user: LoggedUser, body: RefundTicketDto): Promise<TicketData> {
    const tenantUser = await this._checkTenantUser(user);

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const orderTicket = await this.ticketRepository.findOne({
      where: { id: body.ticket, ticketType: TicketType.Order, user: { id: tenantUser.id } },
      relations: {
        shift: true,
        user: true,
        receipts: true,
        itemTickets: { modifiers: true },
        discountTickets: { discount: true },
        refundedTicket: true,
      },
    });

    if (!orderTicket || orderTicket.refundedTicket) {
      throw new BadRequestException('Ticket Not Found or Invalid');
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const localShiftRepo = queryRunner.manager.getRepository(Shift);
    const localTicketRepo = queryRunner.manager.getRepository(Ticket);
    const localItemTicketRepo = queryRunner.manager.getRepository(ItemTicket);
    const localReceiptRepo = queryRunner.manager.getRepository(Receipt);
    const localItemTicketModifierRepo = queryRunner.manager.getRepository(ItemTicketModifier);
    const localDiscountTicketRepo = queryRunner.manager.getRepository(DiscountTicket);

    try {
      const { totalRefundPrice, totalRefundOriginal, totalTaxAmount, totalRefundDiscount, refundedItemTickets } =
        await this._refundItemTickets(body, orderTicket, localItemTicketRepo, localItemTicketModifierRepo);

      const { totalRefundCash, receipts: refundReceipts } = this._refundReceipts(
        body.receipts,
        orderTicket,
        totalRefundPrice < 0 ? 0 : totalRefundPrice,
        localReceiptRepo,
      );

      const refundDiscountTickets = orderTicket.discountTickets.map((discountTicket) => {
        return localDiscountTicketRepo.create({
          discountType: discountTicket.discountType,
          discountName: discountTicket.discountName,
          value: discountTicket.value,
          code: discountTicket.code,
          discount: discountTicket.discount,
        });
      });

      let shift = orderTicket.shift;
      if (orderTicket.shift) {
        await localShiftRepo.save({
          id: orderTicket.shift.id,
          totalCashRefund: convertNumberToFloat(
            orderTicket.shift.totalCashRefund + totalRefundCash,
            this.companyConfig.decimalPlaces,
          ),
        });

        shift = await localShiftRepo.findOne({ where: { id: shift.id } });
      }

      const refundTicket = localTicketRepo.create({
        name: orderTicket.name,
        ticketType: TicketType.Refund,
        type: orderTicket.type,
        totalPrice: convertNumberToFloat(totalRefundPrice < 0 ? 0 : totalRefundPrice, this.companyConfig.decimalPlaces),
        totalPriceOriginal: convertNumberToFloat(
          totalRefundOriginal ? 0 : totalRefundOriginal,
          this.companyConfig.decimalPlaces,
        ),
        itemTickets: refundedItemTickets,
        receipts: refundReceipts,
        totalTaxAmount: convertNumberToFloat(totalTaxAmount, this.companyConfig.decimalPlaces),
        totalDiscount: convertNumberToFloat(totalRefundDiscount, this.companyConfig.decimalPlaces),
        paymentStatus: PaymentStatus.Completed,
        refundedTicket: orderTicket,
        email: orderTicket.email,
        user: tenantUser,
        customer: orderTicket.customer,
        shift: shift,
        discountTickets: refundDiscountTickets,
      });
      await localTicketRepo.save(refundTicket);

      const newRefundTicket = await localTicketRepo.findOne({
        where: { id: refundTicket.id },
      });

      await queryRunner.commitTransaction();

      return new TicketData({
        ...newRefundTicket,
        itemTickets: refundedItemTickets.map((item) => new ItemTicketData(item)),
        discountTickets: refundDiscountTickets.map((discountTicket) => new DiscountTicketData(discountTicket)),
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.log(`${new Date().toString()} 🚀 ~ file: ticket.service.ts ~ TicketService::refund ~ error:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  _checkTenantUser(user: LoggedUser): Promise<TenantUser | null> {
    return this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async _refundItemTickets(
    body: RefundTicketDto,
    orderTicket: Ticket,
    localItemTicketRepo: Repository<ItemTicket>,
    localItemTicketModifierRepo: Repository<ItemTicketModifier>,
  ): Promise<RefundItemTicketInfo> {
    const refundItemIds = body.items.reduce((result, bodyItem) => {
      return [...result, bodyItem.itemTicketId];
    }, []);
    const orderTickets = orderTicket.itemTickets.filter((item) => refundItemIds.includes(item.id));

    if (orderTickets.length !== refundItemIds.length) {
      throw new BadRequestException('Have Invalid Item Ticket');
    }

    let totalRefundPrice = 0;
    let totalRefundOriginal = 0;
    let totalRefundDiscount = 0;
    let totalTaxAmount = 0;

    let refundItems: ItemTicket[] = [];

    for (const orderItemTicket of orderTickets) {
      const bodyRefundItem = body.items.find((bodyItem) => bodyItem.itemTicketId === orderItemTicket.id);

      if (bodyRefundItem.quantity > orderItemTicket.quantity - orderItemTicket.refundedQuantity) {
        throw new BadRequestException('Have item quantity invalid!');
      }

      totalRefundOriginal += orderItemTicket.price * bodyRefundItem.quantity;
      totalRefundPrice += orderItemTicket.discountedPrice * bodyRefundItem.quantity;

      const price = orderItemTicket.modifiers.reduce((result, modifier) => {
        return result + modifier.price;
      }, orderItemTicket.price);
      totalTaxAmount += (price - price / (1 + orderItemTicket.tax / 100)) * bodyRefundItem.quantity;
      totalRefundDiscount += (price - orderItemTicket.discountedPrice) * bodyRefundItem.quantity;

      const modifiers = orderItemTicket.modifiers.map((modifier) => {
        return localItemTicketModifierRepo.create({
          modifierId: modifier.modifierId,
          modifierName: modifier.modifierName,
          optionName: modifier.optionName,
          price: modifier.price,
        });
      });

      const refundItem = localItemTicketRepo.create({
        itemId: orderItemTicket.itemId,
        itemType: orderItemTicket.itemType,
        discountedPrice: orderItemTicket.discountedPrice,
        price: orderItemTicket.price,
        quantity: bodyRefundItem.quantity,
        itemName: orderItemTicket.itemName,
        tax: orderItemTicket.tax,
        options: orderItemTicket.options,
        modifiers,
      });

      await localItemTicketRepo.save({
        ...orderItemTicket,
        refundedQuantity: orderItemTicket.refundedQuantity + bodyRefundItem.quantity,
      });

      refundItems = [...refundItems, refundItem];
    }

    return {
      totalRefundPrice,
      totalRefundOriginal,
      totalRefundDiscount,
      totalTaxAmount,
      refundedItemTickets: refundItems,
    };
  }

  _refundReceipts(
    refundReceipts: RefundReceiptDto[],
    orderTicket: Ticket,
    totalRefundPrice: number,
    localReceiptRepo: Repository<Receipt>,
  ): { totalRefundCash: number; receipts: Receipt[] } {
    // Calculate Receipts
    const receiptTotalPrice = refundReceipts.reduce((result, receipt) => result + receipt.totalAmount, 0);
    if (receiptTotalPrice !== totalRefundPrice) {
      throw new BadRequestException('Receipts is invalid');
    }

    let receipts = [];
    let totalRefundCash = 0;
    for (const refundReceipt of refundReceipts) {
      const dbReceipt = orderTicket.receipts.find((rc) => rc.id === refundReceipt.receiptId);

      if (!dbReceipt || refundReceipt.totalAmount > dbReceipt.totalPrice - dbReceipt.differentAmount) {
        throw new BadRequestException('Receipt data invalid');
      }

      if (dbReceipt.paymentType === PaymentType.Cash) {
        totalRefundCash += refundReceipt.totalAmount;
      }

      const refundReceiptObj = localReceiptRepo.create({
        totalPrice: convertNumberToFloat(refundReceipt.totalAmount, this.companyConfig.decimalPlaces),
        differentAmount: 0,
        paymentType: dbReceipt.paymentType,
        paymentStatus: PaymentStatus.Completed,
        email: dbReceipt.email,
      });

      receipts = [...receipts, refundReceiptObj];
    }

    return { totalRefundCash, receipts };
  }

  async deleteByTicket(body: DeleteReceiptDto) {
    const ticket = await this.ticketRepository.findOne({ where: { id: body.ticket }, relations: { receipts: true } });

    if (!ticket) {
      throw new BadRequestException('Ticket Not Found');
    }

    if (ticket.paymentStatus === PaymentStatus.Completed) {
      throw new BadRequestException('Can not deleted because ticket was paid completely!');
    }

    await this.receiptRepository.remove(ticket.receipts);
  }

  async sendMail({ email, ticketId }: { email: string; ticketId: string }) {
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
}
