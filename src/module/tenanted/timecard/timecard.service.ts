import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoggedUser } from 'src/common/type';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, FindOptionsWhere, ILike, In, IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { TenantUser } from '../user/entity/tenant.user.entity';
import {
  CheckInDTO,
  CreateTimecardDto,
  ExportTimeCardDto,
  ExportWorkedTImeDto,
  FindTimecardDto,
  FindTotalWorkedDto,
  UpdateTimecardDto,
} from './dto/timecard.dto';
import { Timecard, TimecardStatus } from './entity/timecard.entity';
import { TimecardData } from './response/timecard.res';
import { Store } from '../store/entity/store.entity';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/module/public/user/entity/user.entity';
import { TimecardHistory, TimecardHistoryEvent } from './entity/timecard.history.entity';
import * as lodash from 'lodash';
import { convertNumberToFloat, parseXlsx } from 'src/common/utils';

@Injectable()
export class TimecardService {
  private readonly connection: DataSource;
  private readonly timecardRepository: Repository<Timecard>;
  private readonly timecardHistoryRepository: Repository<TimecardHistory>;
  private readonly storeRepository: Repository<Store>;
  private readonly tenantUserRepository: Repository<TenantUser>;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    this.timecardRepository = connection.getRepository(Timecard);
    this.timecardHistoryRepository = connection.getRepository(TimecardHistory);
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.storeRepository = connection.getRepository(Store);
    this.connection = connection;
  }

  async createTimecard({ input, user }: { input: CreateTimecardDto; user: LoggedUser }) {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const { clockIn, clockOut, employee, store } = input;

    const emp = await this.tenantUserRepository.findOneBy({ id: employee });
    if (!emp) {
      throw new BadRequestException('Employee Not Found');
    }

    const st = await this.storeRepository.findOneBy({ id: store });

    if (!st) {
      throw new BadRequestException('Store Not Found');
    }

    if (moment(clockOut) < moment(clockIn)) {
      throw new BadRequestException('Check-out time must be after check-in time');
    }

    const time = moment.duration(moment(clockOut).diff(moment(clockIn))).asHours();

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const timecardRepository = queryRunner.manager.getRepository(Timecard);
      const timecardHistoryRepository = queryRunner.manager.getRepository(TimecardHistory);

      const timecard = timecardRepository.create({
        clockIn,
        clockOut,
        employee: emp,
        store: st,
        time: convertNumberToFloat(time),
        status: TimecardStatus.CLOSED,
      });

      const newTimecard = await timecardRepository.save(timecard);

      const history = timecardHistoryRepository.create({
        clockIn,
        clockOut,
        timecard: newTimecard,
        event: TimecardHistoryEvent.create,
      });
      await timecardHistoryRepository.save(history);
      await queryRunner.commitTransaction();

      return await this.findOne({ id: timecard.id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.service.ts:96 ~ TimecardService ~ createTimecard ~ error:`,
        error,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async find({ page = 0, pageSize = 10, order = 'asc', sort = 'createdAt', search, from, to }: FindTimecardDto) {
    const commonFilter: FindOptionsWhere<Timecard> = {};

    if (from) {
      commonFilter.clockIn = MoreThanOrEqual(from);

      if (to && from < to) {
        commonFilter.clockOut = LessThanOrEqual(to);
      }
    }

    const where: FindOptionsWhere<Timecard> | FindOptionsWhere<Timecard>[] = (search && [
      {
        clockIn: IsNull(),
        clockOut: LessThanOrEqual(to),
        store: {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      },
      {
        clockIn: IsNull(),
        clockOut: LessThanOrEqual(to),
        employee: {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      },
      {
        clockIn: MoreThanOrEqual(from),
        clockOut: IsNull(),
        store: {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      },
      {
        clockIn: MoreThanOrEqual(from),
        clockOut: IsNull(),
        employee: {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      },
      {
        ...commonFilter,
        store: {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      },
      {
        ...commonFilter,
        employee: {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
      },
    ]) || [
      {
        clockIn: IsNull(),
        clockOut: LessThanOrEqual(to),
      },
      {
        clockIn: MoreThanOrEqual(from),
        clockOut: IsNull(),
      },
      {
        ...commonFilter,
      },
    ];

    const [data, total] = await this.timecardRepository.findAndCount({
      where,
      relations: {
        employee: true,
        store: true,
      },
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
      withDeleted: true,
    });

    const responseData: TimecardData[] = data.map((timecard) => {
      const m: TimecardData = {
        ...timecard,
        employee: timecard.employee.name,
        store: timecard.store?.name,
        time: convertNumberToFloat(timecard.time),
      };
      return m;
    });

    return { data: responseData, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateTimecardDto }) {
    const timecard = await this.timecardRepository.findOne({
      where: { id },
    });

    if (!timecard) {
      throw new BadRequestException('Timecard Not Found');
    }
    const {} = updateInput;

    let time: number;
    if (updateInput.clockIn || updateInput.clockOut) {
      time = moment
        .duration(
          moment(updateInput.clockOut || timecard.clockOut).diff(moment(updateInput.clockIn || timecard.clockIn)),
        )
        .asHours();
    }
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const timecardRepository = queryRunner.manager.getRepository(Timecard);
    const timecardHistoryRepository = queryRunner.manager.getRepository(TimecardHistory);

    try {
      const newTimecard = await timecardRepository.save({
        id,
        clockIn: updateInput.clockIn,
        clockOut: updateInput.clockOut,
        time: convertNumberToFloat(time),
      });

      const history = timecardHistoryRepository.create({
        clockIn: newTimecard.clockIn,
        clockOut: newTimecard.clockOut,
        timecard: newTimecard,
        event: TimecardHistoryEvent.update,
      });
      await timecardHistoryRepository.save(history);

      await queryRunner.commitTransaction();

      return await this.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.service.ts:96 ~ TimecardService ~ createTimecard ~ error:`,
        error,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne({ id }: { id: string }) {
    const timecard = await this.timecardRepository.findOne({
      where: { id },
      relations: {
        store: true,
        employee: true,
        histories: true,
      },
      withDeleted: true,
    });

    if (!timecard) {
      return null;
    }
    const empUser = await this.userRepository.findOneBy({ id: timecard.employee.userId });

    return new TimecardData({
      ...timecard,
      store: timecard.store.name,
      employee: empUser.name,
      time: convertNumberToFloat(timecard.time),
    });
  }

  async remove({ id }: { id: string }) {
    const rs = await this.timecardRepository.delete({ id });
    return rs;
  }

  async totalWorked({ employees, page = 0, pageSize = 10, search, from, to }: FindTotalWorkedDto) {
    const where: FindOptionsWhere<TenantUser> | FindOptionsWhere<TenantUser>[] = {};

    employees?.length > 0 && (where.id = In(employees));

    if (!!search) {
      where.name = ILike(`%${search.trim().toLowerCase()}%`);
    }

    const [data, total] = await this.tenantUserRepository.findAndCount({
      where,
      take: pageSize,
      skip: page * pageSize,
      withDeleted: true,
    });

    const timeCardFilter: FindOptionsWhere<Timecard> | FindOptionsWhere<Timecard>[] = {
      employee: In(data.map((d) => d.id)),
    };

    if (from) {
      timeCardFilter.clockIn = MoreThanOrEqual(from);

      if (to && from < to) {
        timeCardFilter.clockOut = LessThanOrEqual(to);
      }
    }

    const timeCards = await this.timecardRepository.find({
      where: timeCardFilter,
      relations: {
        employee: true,
        store: true,
      },
      withDeleted: true,
    });

    const store = await this.storeRepository.findOne({
      where: {
        // ...(search && { name: ILike(`%${search.trim().toLowerCase()}%`) }),
      },
    });

    const g = lodash.groupBy(timeCards, 'employee.id');

    const responseData: {
      employee: string;
      store: string;
      total: number;
    }[] = data.map((user) => {
      const timecards = g[user.id] || [];

      const m = {
        employee: user.name,
        store: timecards[0]?.store.name || store?.name || '',
        total: timecards.reduce((p, c) => {
          return convertNumberToFloat(p + convertNumberToFloat(c.time));
        }, 0),
      };
      return m;
    });

    return { data: responseData, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async exportWorkedTIme({ employees, from, to }: ExportWorkedTImeDto) {
    const where: FindOptionsWhere<TenantUser> | FindOptionsWhere<TenantUser>[] = {};

    employees && employees.length > 0 && (where.id = In(employees));

    const data = await this.tenantUserRepository.find({
      where,
      withDeleted: true,
    });

    const timeCardFilter: FindOptionsWhere<Timecard> | FindOptionsWhere<Timecard>[] = {
      employee: In(data.map((d) => d.id)),
    };

    if (from) {
      timeCardFilter.clockIn = MoreThanOrEqual(from);

      if (to && from < to) {
        timeCardFilter.clockOut = LessThanOrEqual(to);
      }
    }

    const timeCards = await this.timecardRepository.find({
      where: timeCardFilter,
      relations: {
        employee: true,
        store: true,
      },
      withDeleted: true,
    });

    const store = await this.storeRepository.findOne({
      where: {
        // ...(search && { name: ILike(`%${search.trim().toLowerCase()}%`) }),
      },
    });

    const g = lodash.groupBy(timeCards, 'employee.id');

    const responseData: {
      Employee: string;
      Email: string;
      Store: string;
      'Total hours': number;
    }[] = data.map((user) => {
      const timecards = g[user.id] || [];

      const m = {
        Employee: user.name,
        Email: user.email,
        Store: timecards[0]?.store.name || store?.name || '',
        'Total hours': timecards.reduce((p, c) => {
          return convertNumberToFloat(p + convertNumberToFloat(c.time));
        }, 0),
      };
      return m;
    });

    return responseData;
  }

  async template() {
    const timeCardData = [
      {
        email: 'address@gmail.com',
        clock_in: '13:00 10-10-2023 +07:00',
        clock_out: '18:25 10-10-2023 +07:00',
      },
    ];
    return timeCardData;
  }

  async export({ employees, from, to }: ExportTimeCardDto) {
    const where: FindOptionsWhere<Timecard> | FindOptionsWhere<Timecard>[] = {};

    employees?.length > 0 && (where.employee = { id: In(employees) });

    if (from) {
      where.clockIn = MoreThanOrEqual(from);

      if (to && from < to) {
        where.clockOut = LessThanOrEqual(to);
      }
    }

    const items = await this.timecardRepository.find({
      where,
      relations: {
        employee: true,
        store: true,
      },
    });

    const timeCards = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const timeCardData = {
        employee: item.employee.name,
        Email: item.employee.email,
        'Clock In': moment(item.clockIn).format('HH:mm DD-MM-YYYY Z'),
        'Clock Out': moment(item.clockOut).format('HH:mm DD-MM-YYYY Z'),
        'Total hours': convertNumberToFloat(item.time),
        Store: item.store.name,
      };
      timeCards.push(timeCardData);
    }
    return lodash.orderBy(timeCards, ['email'], ['asc']);
  }

  async import({ file }: { file: Express.Multer.File }) {
    const defaultKey = ['email', 'clock_in', 'clock_out'];
    const xlsxData = parseXlsx(file.buffer);
    const firstSheet = xlsxData[0].data;
    // verify header
    const keys = Object.keys(firstSheet[0]);
    if (defaultKey.some((k) => !keys.includes(k))) {
      throw new BadRequestException('Format wrong');
    }

    const store = (await this.storeRepository.find())[0];

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const timecardRepository = queryRunner.manager.getRepository(Timecard);
    const timecardHistoryRepository = queryRunner.manager.getRepository(TimecardHistory);

    try {
      while (firstSheet.length > 0) {
        const data = firstSheet.splice(0, 2);
        await Promise.allSettled(
          data.map(async (d) => {
            const { email, clock_in, clock_out } = d;

            const emp = await this.tenantUserRepository.findOneBy({ email });
            if (!emp || !clock_in || !clock_out) {
              return;
            }

            const clockOut = moment(clock_out);
            const clockIn = moment(clock_in);
            if (!clockOut.isValid() || !clockIn.isValid()) {
              return;
            }

            if (clockOut < clockIn) {
              return;
            }

            const time = moment.duration(moment(clockOut).diff(moment(clockIn))).asHours();

            const timecard = timecardRepository.create({
              clockIn: moment(),
              clockOut,
              employee: emp,
              store: store,
              time: convertNumberToFloat(time),
            });

            const newTimecard = await timecardRepository.save(timecard);

            const history = timecardHistoryRepository.create({
              clockIn,
              clockOut,
              timecard: newTimecard,
              event: TimecardHistoryEvent.create,
            });
            await timecardHistoryRepository.save(history);
          }),
        );
      }
      await queryRunner.commitTransaction();

      return 'Import completed';
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.service.ts:407 ~ TimecardService ~ import ~ error:`,
        error,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clockIn({ loggedUser, input }: { loggedUser: LoggedUser; input: CheckInDTO }) {
    const { store } = input;
    const emp = await this.tenantUserRepository.findOneBy({ userId: loggedUser.id });

    const st = await this.storeRepository.findOneBy({ id: store });

    if (!st) {
      throw new BadRequestException('Store Not Found');
    }
    const clockIn = new Date();
    const time = 0;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const timecardRepository = queryRunner.manager.getRepository(Timecard);
      const timecardHistoryRepository = queryRunner.manager.getRepository(TimecardHistory);

      const oldTimecard = await timecardRepository.findOne({
        where: {
          employee: {
            id: emp.id,
          },
          store: {
            id: st.id,
          },
          status: TimecardStatus.OPEN,
        },
        order: {
          createdAt: -1,
        },
      });

      if (oldTimecard) {
        oldTimecard.status = TimecardStatus.CLOSED;
        await timecardRepository.save(oldTimecard);
      }

      const timecard = timecardRepository.create({
        clockIn,
        employee: emp,
        store: st,
        time: convertNumberToFloat(time),
        status: TimecardStatus.OPEN,
      });

      const newTimecard = await timecardRepository.save(timecard);

      const history = timecardHistoryRepository.create({
        clockIn,
        timecard: newTimecard,
        event: TimecardHistoryEvent.create,
      });
      await timecardHistoryRepository.save(history);
      await queryRunner.commitTransaction();

      return await this.findOne({ id: timecard.id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.service.ts:96 ~ TimecardService ~ createTimecard ~ error:`,
        error,
      );

      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clockOut({ loggedUser, input }: { loggedUser: LoggedUser; input: CheckInDTO }) {
    const { store } = input;
    const emp = await this.tenantUserRepository.findOneBy({ userId: loggedUser.id });

    const st = await this.storeRepository.findOneBy({ id: store });

    if (!st) {
      throw new BadRequestException('Store Not Found');
    }
    const clockOut = new Date();

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    const timecardRepository = queryRunner.manager.getRepository(Timecard);
    const timecardHistoryRepository = queryRunner.manager.getRepository(TimecardHistory);

    await queryRunner.startTransaction();

    let timecardId: string;

    try {
      const timecard = await timecardRepository.findOne({
        where: {
          employee: {
            id: emp.id,
          },
          store: {
            id: st.id,
          },
        },
        order: {
          createdAt: -1,
        },
      });

      if (timecard && !timecard.clockOut) {
        timecardId = timecard.id;
        const time = timecard.clockIn ? moment.duration(moment(clockOut).diff(moment(timecard.clockIn))).asHours() : 0;

        timecard.clockOut = clockOut;
        timecard.time = time;
        timecard.status = TimecardStatus.CLOSED;

        await timecardRepository.save(timecard);

        const history = timecardHistoryRepository.create({
          clockOut,
          timecard: timecard,
          event: TimecardHistoryEvent.update,
        });
        await timecardHistoryRepository.save(history);
      } else {
        const timecard = timecardRepository.create({
          clockOut,
          employee: emp,
          store: st,
          status: TimecardStatus.CLOSED,
          time: convertNumberToFloat(0),
        });

        const newTimecard = await timecardRepository.save(timecard);
        timecardId = newTimecard.id;

        const history = timecardHistoryRepository.create({
          clockOut,
          timecard: newTimecard,
          event: TimecardHistoryEvent.create,
        });

        await timecardHistoryRepository.save(history);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.service.ts:96 ~ TimecardService ~ createTimecard ~ error:`,
        error,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    return this.findOne({ id: timecardId });
  }
}
