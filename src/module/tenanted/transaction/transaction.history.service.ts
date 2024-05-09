import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.response';
import { LoggedUser } from 'src/common/type';
import { convertNumberToFloat } from 'src/common/utils';
import { MailService } from 'src/module/common/mail/mail.service';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Company } from 'src/module/public/company/entity/company.entity';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Shift } from '../shift/entity/shift.entity';
import { Receipt } from '../ticket/entity/receipt.entity';
import { Ticket } from '../ticket/entity/ticket.entity';
import { PaymentStatus, PaymentType } from '../ticket/utils/enum';
import {
  CreateTransactionHistoryDto,
  FindTransactionHistoryDto,
  UpdateTransactionHistoryDto,
} from './dto/transaction.history.dto';
import { TransactionHistory } from './entity/transaction.history.entity';
import { TransactionHistoryData } from './response/transaction.history.res';
import { TransactionPaymentStatus } from './utils/enum';

@Injectable()
export class TransactionHistoryService {
  private readonly transactionHistoryRepository: Repository<TransactionHistory>;
  private readonly receiptRepository: Repository<Receipt>;
  private readonly ticketRepository: Repository<Ticket>;
  private readonly connection: DataSource;
  private readonly companyConfig: CompanyConfig;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyConfig) private readonly companyConfigRepository: Repository<CompanyConfig>,
    private mailService: MailService,
    @Inject(COMPANY_CONFIG) companyConfig,
  ) {
    this.transactionHistoryRepository = connection.getRepository(TransactionHistory);
    this.receiptRepository = connection.getRepository(Receipt);
    this.ticketRepository = connection.getRepository(Ticket);
    this.connection = connection;

    this.companyConfig = companyConfig;
  }

  async create({ input, loggedUser }: { input: CreateTransactionHistoryDto; loggedUser: LoggedUser }) {
    console.log(
      `${new Date().toString()} 🚀 ~ file: transaction.history.service.ts:36 ~ TransactionHistoryService ~ create ~ loggedUser:`,
      loggedUser,
    );
    const { receiptId } = input;

    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId },
      relations: { ticket: true },
    });

    if (!receipt || receipt.paymentStatus !== PaymentStatus.Pending) {
      throw new BadRequestException('Receipt is Invalid');
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const localReceiptRepo = queryRunner.manager.getRepository(Receipt);
    const localTransactionRepo = queryRunner.manager.getRepository(TransactionHistory);
    const localShiftRepo = queryRunner.manager.getRepository(Shift);
    const localTicketRepo = queryRunner.manager.getRepository(Ticket);

    try {
      const transaction = localTransactionRepo.create({
        ...input,
        receipt: receipt,
      });

      const savedTransaction = await localTransactionRepo.save(transaction);

      if (input.paymentStatus === TransactionPaymentStatus.Successful) {
        await localReceiptRepo.save({
          id: receipt.id,
          totalPrice: convertNumberToFloat(input.amount, this.companyConfig.decimalPlaces),
          paymentStatus: PaymentStatus.Completed,
        });

        const ticket = await localTicketRepo.findOne({
          where: { id: receipt.ticket.id },
          relations: { receipts: true, shift: true },
        });

        if (ticket) {
          let totalCashAmount = 0;
          let totalCardAmount = 0;
          let totalDifferentAmount = 0;

          for (const ticketReceipt of ticket.receipts) {
            if (ticketReceipt.paymentStatus === PaymentStatus.Completed) {
              if (ticketReceipt.paymentType === PaymentType.Card) {
                totalCardAmount += ticketReceipt.totalPrice;
              } else {
                totalCashAmount += ticketReceipt.totalPrice;
                totalDifferentAmount += ticketReceipt.differentAmount;
              }
            }
          }

          if (totalCardAmount + totalCashAmount - totalDifferentAmount === ticket.totalPrice) {
            await localTicketRepo.save({
              id: ticket.id,
              paymentStatus: PaymentStatus.Completed,
            });

            if (ticket.shift) {
              await localShiftRepo.save({
                id: ticket.shift.id,
                totalCash: convertNumberToFloat(
                  ticket.shift.totalCash + totalCashAmount,
                  this.companyConfig.decimalPlaces,
                ),
                totalCard: convertNumberToFloat(
                  ticket.shift.totalCard + totalCardAmount,
                  this.companyConfig.decimalPlaces,
                ),
              });
            }
          }
        }
      }

      const newTransaction = await localTransactionRepo.findOne({
        where: { id: savedTransaction.id },
        relations: { receipt: true },
      });

      await queryRunner.commitTransaction();

      if (receipt.email && receipt.ticket) {
        this.sendMail({ email: receipt.email, ticketId: receipt.ticket.id });
      }

      return new TransactionHistoryData(newTransaction);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(
        `${new Date().toString()} 🚀 ~ file: transaction.history.service.ts:create ~ TransactionHistoryService ~ error: ${err}`,
      );

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async find({
    query: { page = 0, pageSize = 10, order = 'asc', sort = 'createdAt', search },
    loggedUser,
  }: {
    query: FindTransactionHistoryDto;
    loggedUser: LoggedUser;
  }): Promise<Pagination<TransactionHistoryData>> {
    console.log(
      `${new Date().toString()} 🚀 ~ file: transaction.history.service.ts:52 ~ TransactionHistoryService ~ loggedUser:`,
      loggedUser,
    );
    const where: FindOptionsWhere<TransactionHistory> | FindOptionsWhere<TransactionHistory>[] = (search && [{}]) || {};
    const [data, total] = await this.transactionHistoryRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    return {
      data: data.map(
        (d) =>
          new TransactionHistoryData({
            ...d,
          }),
      ),
      page,
      pageSize,
      total,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateTransactionHistoryDto }) {
    const tenantUser = await this.transactionHistoryRepository.findOne({
      where: { id },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const {} = updateInput;

    await this.transactionHistoryRepository.update({ id }, {});

    return this.findOne({ id: tenantUser.id });
  }

  async findOne({ id }: { id: string }) {
    const item = await this.transactionHistoryRepository.findOne({
      where: { id },
      relations: {},
    });
    return new TransactionHistoryData({ ...item });
  }

  async remove({ id }: { id: string }) {
    const user = await this.transactionHistoryRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    const rs = await this.transactionHistoryRepository.softDelete({ id });
    return rs;
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
