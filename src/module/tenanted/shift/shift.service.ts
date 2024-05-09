import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment-timezone';
import { LoggedUser } from 'src/common/type';
import { convertNumberToFloat } from 'src/common/utils';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Company } from 'src/module/public/company/entity/company.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { And, DataSource, IsNull, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Store } from '../store/entity/store.entity';
import { Ticket } from '../ticket/entity/ticket.entity';
import { PaymentStatus, PaymentType, TicketType } from '../ticket/utils/enum';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { CloseShiftDto, OpenShiftDto, ReportDataDto } from './dto/shift.dto';
import { Shift } from './entity/shift.entity';
import { ShiftData } from './response/shift.res';
import { StoreService } from '../store/store.service';
import { MailService } from 'src/module/common/mail/mail.service';
import { EndDayReportDto } from '../store/dto/store.dto';
import { CompanyConfig } from '../../public/company_config/entity/company.config.entity';

export class ShiftService {
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly shiftRepository: Repository<Shift>;
  private readonly storeRepository: Repository<Store>;
  private readonly companyConfig: CompanyConfig;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly storeService: StoreService,
    private readonly mailService: MailService,
    @Inject(COMPANY_CONFIG) companyConfig: CompanyConfig,
  ) {
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.shiftRepository = connection.getRepository(Shift);
    this.storeRepository = connection.getRepository(Store);

    this.companyConfig = companyConfig;
  }

  async open(user: LoggedUser, body: OpenShiftDto): Promise<ShiftData> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const openingShift = await this.shiftRepository.findOne({
      relations: { user: true },
      where: {
        user: {
          id: tenantUser.id,
        },
        closedAt: IsNull(),
      },
    });

    if (openingShift) {
      throw new BadRequestException('Have opening shift already');
    }

    let shiftItem = this.shiftRepository.create({
      ...body,
      user: tenantUser,
    });

    try {
      await this.shiftRepository.save(shiftItem);

      shiftItem = await this.shiftRepository.findOne({
        where: { id: shiftItem.id },
        relations: { user: true },
      });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: shift.service.ts ~ ShiftService::open ~ error:`, error);
      throw error;
    }

    return new ShiftData(shiftItem);
  }

  async close(user: LoggedUser, id: string, body: CloseShiftDto): Promise<ShiftData> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    let shiftItem = await this.shiftRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
      },
    });

    if (!shiftItem || shiftItem?.user?.id !== tenantUser.id) {
      throw new BadRequestException('Shift value and user invalid');
    }

    if (shiftItem.closedAt) {
      throw new BadRequestException('Shift was closed');
    }

    try {
      await this.shiftRepository.save({
        id,
        ...body,
        closedAt: new Date(),
      });

      shiftItem = await this.shiftRepository.findOne({ where: { id }, relations: { user: true } });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: shift.service.ts ~ ShiftService::close ~ error:`, error);
      throw error;
    }
    // send end day report ;
    this.sendEndDayReportToOwner({
      loggedUser: user,
      query: {
        from: shiftItem.openedAt,
        to: new Date(),
      },
    });

    return new ShiftData(shiftItem);
  }

  async sendEndDayReportToOwner({ loggedUser, query }: { loggedUser: LoggedUser; query: EndDayReportDto }) {
    console.log(
      `${new Date().toString()} 🚀 ~ file: shift.service.ts:138 ~ ShiftService ~ sendEndDayReportToOwner ~ query:`,
      query,
    );
    try {
      const data = await this.storeService.endDayReport({ loggedUser, query });
      const user = await this.userRepository.findOne({
        where: {
          id: loggedUser.id,
        },
      });
      const company = await this.companyRepository.findOne({
        where: {
          id: user.companyId,
        },
      });
      await this.mailService.sendEndDayReport({ email: company.ownerEmail, xmlFile: data });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.service.ts:132 ~ ShiftService ~ sendEndDayReportToOwner ~ error:`,
        error,
      );
    }
  }

  async findCurrentByUser(user: LoggedUser): Promise<ShiftData | null> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const shiftItem = await this.shiftRepository.findOne({
      relations: { user: true, tickets: { itemTickets: true, receipts: true } },
      where: {
        user: {
          id: tenantUser.id,
        },
        closedAt: IsNull(),
      },
    });

    if (!shiftItem) {
      throw new NotFoundException('Shift not found');
    }

    const { totalCashRefund, totalCardRefund, totalTax } = this._calculateRefundAndTaxOfShift(shiftItem.tickets);

    delete shiftItem.tickets;

    return new ShiftData({
      ...shiftItem,
      totalCardRefund: convertNumberToFloat(totalCardRefund, this.companyConfig.decimalPlaces),
      totalCashRefund: convertNumberToFloat(totalCashRefund, this.companyConfig.decimalPlaces),
      totalTax: convertNumberToFloat(totalTax, this.companyConfig.decimalPlaces),
      companyConfig: this.companyConfig,
    });
  }

  async find(user: LoggedUser, id: string): Promise<ShiftData | null> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const shiftItem = await this.shiftRepository.findOne({
      relations: { user: true, tickets: { itemTickets: true, receipts: true } },
      where: {
        id: id,
      },
    });

    if (!shiftItem) {
      throw new NotFoundException('Shift not found');
    }

    if (shiftItem.user.id !== tenantUser.id) {
      throw new BadRequestException('User and shift is invalid');
    }

    const { totalCashRefund, totalCardRefund, totalTax } = this._calculateRefundAndTaxOfShift(shiftItem.tickets);

    delete shiftItem.tickets;

    return new ShiftData({
      ...shiftItem,
      totalCardRefund: convertNumberToFloat(totalCardRefund, this.companyConfig.decimalPlaces),
      totalCashRefund: convertNumberToFloat(totalCashRefund, this.companyConfig.decimalPlaces),
      totalTax: convertNumberToFloat(totalTax, this.companyConfig.decimalPlaces),
      companyConfig: this.companyConfig,
    });
  }

  async getList(user: LoggedUser): Promise<ShiftData[]> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const shiftList = await this.shiftRepository.find({
      relations: { user: true, tickets: { itemTickets: true, receipts: true } },
      where: {
        user: {
          id: tenantUser.id,
        },
      },
      order: {
        openedAt: 'DESC',
      },
    });

    return shiftList.map((shiftItem) => {
      const { totalCashRefund, totalCardRefund, totalTax } = this._calculateRefundAndTaxOfShift(shiftItem.tickets);

      delete shiftItem.tickets;

      return new ShiftData({
        ...shiftItem,
        totalCardRefund: convertNumberToFloat(totalCardRefund, this.companyConfig.decimalPlaces),
        totalCashRefund: convertNumberToFloat(totalCashRefund, this.companyConfig.decimalPlaces),
        totalTax: convertNumberToFloat(totalTax, this.companyConfig.decimalPlaces),
        companyConfig: this.companyConfig,
      });
    });
  }

  async getHistoryList(user: LoggedUser): Promise<ShiftData[]> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const shiftList = await this.shiftRepository.find({
      relations: { user: true, tickets: { itemTickets: true, receipts: true } },
      where: {
        user: {
          id: tenantUser.id,
        },
        closedAt: Not(IsNull()),
      },
      order: {
        openedAt: 'DESC',
      },
    });

    return shiftList.map((shiftItem) => {
      const { totalCashRefund, totalCardRefund, totalTax } = this._calculateRefundAndTaxOfShift(shiftItem.tickets);

      delete shiftItem.tickets;

      return new ShiftData({
        ...shiftItem,
        totalCardRefund: convertNumberToFloat(totalCardRefund, this.companyConfig.decimalPlaces),
        totalCashRefund: convertNumberToFloat(totalCashRefund, this.companyConfig.decimalPlaces),
        totalTax: convertNumberToFloat(totalTax, this.companyConfig.decimalPlaces),
        companyConfig: this.companyConfig,
      });
    });
  }

  async reportData({ loggedUser, query }: { loggedUser: LoggedUser; query: ReportDataDto }) {
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

    const shifts = await this.shiftRepository.find({
      where: {
        openedAt: And(MoreThanOrEqual(startDate.toDate()), LessThanOrEqual(endDate.toDate())),
        closedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: { user: true, tickets: { receipts: true, itemTickets: true } },
    });

    const stores = await this.storeRepository.find({});

    return shifts.map((shift) => {
      const { totalCashRefund, totalCardRefund, totalTax } = this._calculateRefundAndTaxOfShift(shift.tickets);

      delete shift.tickets;

      return new ShiftData({
        ...shift,
        employeeName: shift.user?.name,
        storeName: stores.length ? stores[0].name : null,
        totalCardRefund: convertNumberToFloat(totalCardRefund, this.companyConfig.decimalPlaces),
        totalCashRefund: convertNumberToFloat(totalCashRefund, this.companyConfig.decimalPlaces),
        totalTax: convertNumberToFloat(totalTax, this.companyConfig.decimalPlaces),
        companyConfig: this.companyConfig,
      });
    });
  }

  _calculateRefundAndTaxOfShift(tickets: Ticket[]): {
    totalCashRefund: number;
    totalCardRefund: number;
    totalTax: number;
  } {
    let totalCashRefund = 0;
    let totalCardRefund = 0;
    let totalTax = 0;

    tickets.forEach((ticket) => {
      if (ticket.paymentStatus === PaymentStatus.Completed) {
        if (ticket.ticketType === TicketType.Order) {
          ticket.itemTickets.forEach((itemTicket) => {
            const tax = (itemTicket.price - itemTicket.price / (1 + itemTicket.tax / 100)) * itemTicket.quantity;

            totalTax += tax;
          });
        } else {
          ticket.receipts.forEach((receipt) => {
            if (receipt.paymentType === PaymentType.Card) {
              totalCardRefund += receipt.totalPrice;
            } else {
              totalCashRefund += receipt.totalPrice;
            }
          });
        }
      }
    });

    return { totalCardRefund, totalCashRefund, totalTax };
  }
}
