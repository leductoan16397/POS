import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { And, DataSource, FindOptionsWhere, ILike, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { COMPANY_CONFIG, CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { Store } from './entity/store.entity';
import { Pagination } from '../../../common/common.response';
import { CreateStoreDto, EndDayReportDto, GetStoreListDto, UpdateStoreDto } from './dto/store.dto';
import { StoreData } from './response/store.res';
import { XMLBuilder } from 'fast-xml-parser';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggedUser } from 'src/common/type';
import { Company } from 'src/module/public/company/entity/company.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import * as moment from 'moment-timezone';
import { Ticket } from '../ticket/entity/ticket.entity';
import { PaymentStatus } from '../ticket/utils/enum';
import { convertNumberToFloat } from 'src/common/utils';
import { APP_NAME } from 'src/common/constant';
import { CompanyConfig } from '../../public/company_config/entity/company.config.entity';

@Injectable()
export class StoreService {
  private readonly storeRepository: Repository<Store>;
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly ticketRepository: Repository<Ticket>;
  private readonly companyConfig: CompanyConfig;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @Inject(COMPANY_CONFIG) companyConfig: CompanyConfig,
  ) {
    this.storeRepository = connection.getRepository(Store);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.ticketRepository = connection.getRepository(Ticket);

    this.companyConfig = companyConfig;
  }

  async getList({
    page = 0,
    pageSize = 10,
    order = 'asc',
    sort = 'name',
    search,
  }: GetStoreListDto): Promise<Pagination<Store>> {
    const where: FindOptionsWhere<Store> | FindOptionsWhere<Store>[] =
      (search && [
        {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      ]) ||
      {};
    const [data, total] = await this.storeRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    return { data, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async findOne(id: string): Promise<Store | undefined> {
    return this.storeRepository.findOne({
      where: { id },
    });
  }

  async store(data: CreateStoreDto): Promise<Store> {
    console.log(data);
    const store = this.storeRepository.create(data);
    return this.storeRepository.save(store);
  }

  async update({ id, data }: { id: string; data: UpdateStoreDto }): Promise<Store> {
    const store: Store | null = await this.storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      throw new BadRequestException('Store Not Found');
    }

    await this.storeRepository.save({ id, ...data });

    const newStore = await this.storeRepository.findOneBy({ id });

    return new StoreData(newStore);
  }

  async destroy(id: string) {
    return this.storeRepository.delete(id);
  }

  async endDayReport({ loggedUser, query }: { loggedUser: LoggedUser; query: EndDayReportDto }) {
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

    const owner = await this.userRepository.findOne({
      where: {
        email: company.ownerEmail,
      },
    });

    const tenantUsers = await this.tenantUserRepository.find({
      relations: {
        group: true,
      },
    });

    const employees = await this.userRepository.find({
      where: {
        id: In(tenantUsers.map((t) => t.userId)),
      },
    });

    const store = (await this.storeRepository.find({}))[0];

    const startDate = from ? moment(from) : moment().tz(company.config.timezone).startOf('D');

    const endDate = to ? moment(to) : moment().tz(company.config.timezone).endOf('d');

    const completedTickets = await this.ticketRepository.find({
      where: {
        createdAt: And(MoreThanOrEqual(startDate.toDate()), LessThanOrEqual(endDate.toDate())),
        paymentStatus: PaymentStatus.Completed,
      },
      relations: {
        user: true,
        itemTickets: true,
        receipts: true,
        discountTickets: {
          discount: true,
        },
      },
    });

    const transactions = completedTickets.map((ticket, index) => {
      const ctLines = ticket.itemTickets.map((it, i) => {
        const vatPerc = (it.tax && it.tax / 100) || 0;
        const vatAmnt = (it.tax && (it.discountedPrice * it.tax * it.quantity) / 100) || 0;
        const vatBasAmnt = convertNumberToFloat(it.discountedPrice, this.companyConfig.decimalPlaces) * it.quantity;
        return {
          nr: i + 1,
          lineID: it.itemId,
          lineType: ticket.ticketType,
          artID: 'unknown',
          qnt: it.quantity,
          lineAmntIn: convertNumberToFloat(it.price, this.companyConfig.decimalPlaces) * it.quantity,
          lineAmntEx: convertNumberToFloat(it.discountedPrice, this.companyConfig.decimalPlaces) * it.quantity,
          amntTp: 'D',
          ppu: convertNumberToFloat(it.price, this.companyConfig.decimalPlaces),
          empID: ticket.user.id,
          cashTransLineDescr: 'unknown',
          lineDate: moment(it.createdAt).tz(company.config.timezone).format('YYYY-MM-DD'),
          lineTime: moment(it.createdAt).tz(company.config.timezone).format('HH:mm:ss'),
          vat: {
            vatPerc,
            vatAmnt: convertNumberToFloat(vatAmnt, this.companyConfig.decimalPlaces),
            vatAmntTp: 'D',
            vatBasAmnt,
          },
          discount: {
            dscTp: 'unknown',
            dscAmnt:
              ticket.discountTickets.length > 0
                ? convertNumberToFloat(it.price - it.discountedPrice, this.companyConfig.decimalPlaces)
                : 0,
          },
        };
      });
      // const totalVatAmnt = ctLines.reduce((p, c) => p + c.vat.vatAmnt, 0);

      const discounts = ticket.discountTickets.map((d) => {
        return {
          dscTp: d.discountType,
          dscAmnt: d.value,
        };
      });

      return {
        nr: index + 1,
        transID: ticket.id,
        transType: ticket.ticketType,
        transAmntIn: convertNumberToFloat(ticket.totalPriceOriginal, this.companyConfig.decimalPlaces),
        transAmntEx: convertNumberToFloat(ticket.totalPrice, this.companyConfig.decimalPlaces),
        amntTp: 'D',
        empID: ticket.user.id,
        transDate: moment(ticket.createdAt).tz(company.config.timezone).format('YYYY-MM-DD'),
        transTime: moment(ticket.createdAt).tz(company.config.timezone).format('HH:mm:ss'),
        ctLine: ctLines,
        vat: {
          vatCode: 'unknown',
          vatPerc: 0,
          vatAmnt: 0.0,
          vatAmntTp: 'D',
          vatBasAmnt: 0.0,
        },
        discount: discounts,
        payment: {
          paymentType: ticket.receipts[0]?.paymentType,
          paidAmnt: convertNumberToFloat(ticket.totalPrice, this.companyConfig.decimalPlaces),
          empID: ticket.user.id,
        },
        signature: 'unknown',
        keyVersion: 'unknown',
        certificateData: 'unknown',
        voidTransaction: '1',
        trainingID: '1',
      };
    });

    const obj = {
      header: {
        fiscalYear: new Date().getFullYear(),
        startDate: moment().startOf('years').format('YYYY-MM-DD'),
        endDate: moment().endOf('years').format('YYYY-MM-DD'),
        curCode: company.config.currencyCode,
        dateCreated: moment(company.createdAt).format('YYYY-MM-DD'),
        timeCreated: moment(company.createdAt).format('HH:mm:ss'),
        softwareDesc: APP_NAME || 'Haibai POS',
        softwareVersion: '0.0.1',
        softwareCompanyName: APP_NAME || 'Haibai POS',
        auditfileVersion: '1.0',
      },
      company: {
        companyIdent: company.id,
        companyName: company.businessName,
        taxRegistrationCountry: owner.country,
        taxRegIdent: company.config.taxCode || 'unknown',
        // dateOfEntry: moment(company.createdAt).format('YYYY-MM-DD'),
        streetAddress: {
          streetname: company.config.address || 'unknown',
          number: owner.phone || 'unknown',
          city: company.config.city,
          postalCode: company.config.zipCode,
          country: owner.country,
        },
        vatCodeDetails: {
          vatCodeDetail: [
            {
              vatCode: company.config.taxCode || 'unknown',
              dateOfEntry: moment(company.createdAt).format('YYYY-MM-DD'),
              standardVatCode: 'unknown',
            },
          ],
        },
        periods: [
          {
            period: {
              periodNumber: 1,
              startDatePeriod: startDate.format('YYYY-MM-DD'),
              startTimePeriod: startDate.format('HH:mm:ss'),
              endDatePeriod: endDate.format('YYYY-MM-DD'),
              endTimePeriod: endDate.format('HH:mm:ss'),
            },
          },
        ],
        employees: {
          employee: employees.map((emp) => {
            const tUser = tenantUsers.find((item) => item.userId === emp.id);
            return {
              empID: emp.id,
              dateOfEntry: moment(emp.createdAt).format('YYYY-MM-DD'),
              timeOfEntry: moment(emp.createdAt).format('HH:mm:ss'),
              firstName: emp.name.split(' ')[0],
              surName: emp.name.split(' ').slice(1).join(' ') || 'unknown',
              employeeRole: {
                roleType: tUser?.group?.name || 'unknown',
                roleTypeDesc: tUser?.group?.name || 'unknown',
              },
            };
          }),
        },
        articles: {
          article: [
            {
              artID: 'unknown',
              dateOfEntry: moment(company.createdAt).format('YYYY-MM-DD'),
              artDesc: 'unknown',
            },
          ],
        },
        basics: {
          basic: [
            {
              basicType: 'unknown',
              basicID: 'unknown',
              basicDesc: 'unknown',
            },
          ],
        },
        location: {
          name: company.config.countryId,
          streetAddress: {
            streetname: store.address || company.config.address || 'unknown',
            number: owner.phone || 'unknown',
            city: company.config.city,
            postalCode: company.config.zipCode,
            country: owner.country,
          },
          cashregister: {
            registerID: store.id,
            regDesc: store.name,
            event: {
              eventID: 'unknown',
              eventType: 'unknown',
              empID: 'unknown',
              eventDate: moment().tz(company.config.timezone).format('YYYY-MM-DD'),
              eventTime: moment().tz(company.config.timezone).format('HH:mm:ss'),
            },
            cashtransaction: transactions,
          },
        },
      },
    };

    const builder = new XMLBuilder({
      format: true,
    });
    const xmlContent = builder.build(obj);

    const rs = `<?xml version="1.0" encoding="UTF-8"?>
<auditfile xmlns="urn:StandardAuditFile-Taxation-CashRegister:DK">
  ${xmlContent}
</auditfile>`;

    return rs;
  }
}
