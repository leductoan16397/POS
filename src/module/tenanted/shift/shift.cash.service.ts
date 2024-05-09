import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoggedUser } from 'src/common/type';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { CreateShiftCashDto } from './dto/shift.cash.dto';
import { ShiftCash } from './entity/shift.cash.entity';
import { Shift } from './entity/shift.entity';
import { ShiftCashData } from './response/shift.cash.res';
import { ShiftCashType } from './utils/shift.cash.const';

@Injectable()
export class ShiftCashService {
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly shiftRepository: Repository<Shift>;
  private readonly shiftCashRepository: Repository<ShiftCash>;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.shiftRepository = connection.getRepository(Shift);
    this.shiftCashRepository = connection.getRepository(ShiftCash);
  }

  async getListOfShift(user: LoggedUser, shiftId: string): Promise<ShiftCashData[]> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const shiftItem = await this.shiftRepository.findOne({
      where: {
        id: shiftId,
        user: { id: tenantUser.id },
      },
      relations: {
        user: true,
      },
    });

    if (!shiftItem) {
      throw new BadRequestException('ShiftId is invalid');
    }

    const shiftCashes = await this.shiftCashRepository.find({
      where: {
        shift: {
          id: shiftId,
        },
      },
      order: { createdAt: 'DESC' },
      relations: { shift: true },
    });

    return shiftCashes.map((item) => new ShiftCashData(item));
  }

  async store(user: LoggedUser, body: CreateShiftCashDto): Promise<ShiftCashData> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const shiftItem = await this.shiftRepository.findOne({
      where: {
        id: body.shiftId,
        user: { id: tenantUser.id },
      },
      relations: {
        user: true,
      },
    });

    if (!shiftItem) {
      throw new BadRequestException('ShiftId is invalid');
    }

    if (shiftItem.closedAt) {
      throw new BadRequestException('Shift was closed');
    }

    let shiftCashItem = this.shiftCashRepository.create({
      ...body,
      shift: shiftItem,
    });

    try {
      await this.shiftCashRepository.save(shiftCashItem);

      if (body.type === ShiftCashType.Payin) {
        await this.shiftRepository.save({
          ...shiftItem,
          totalPayin: shiftItem.totalPayin + body.amount,
        });
      } else {
        await this.shiftRepository.save({
          ...shiftItem,
          totalPayout: shiftItem.totalPayout + body.amount,
        });
      }

      shiftCashItem = await this.shiftCashRepository.findOneBy({ id: shiftCashItem.id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.cash.service.ts ~ ShiftCashService::store ~ error:`,
        error,
      );
      throw error;
    }

    return new ShiftCashData(shiftCashItem);
  }
}
