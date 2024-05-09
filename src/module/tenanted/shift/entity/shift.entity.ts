import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Ticket } from '../../ticket/entity/ticket.entity';
import { TenantUser } from '../../user/entity/tenant.user.entity';
import { ShiftCash } from './shift.cash.entity';

@Entity({ name: 'shifts' })
export class Shift extends AbstractEntity {
  @Column({ nullable: false, type: 'timestamp', default: 'CURRENT_TIMESTAMP' })
  openedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  closedAt: Date;

  @Column({ readonly: true })
  shiftNumber: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  initialCash: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalPayin: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalPayout: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalCash: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalCashRefund: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalCard: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalDiscount: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  actualCash: number;

  @ManyToOne(() => TenantUser, (user) => user.shifts, { nullable: true })
  user: TenantUser;

  @OneToMany(() => ShiftCash, (cash) => cash.shift)
  cashes: ShiftCash[];

  @OneToMany(() => Ticket, (ticket) => ticket.shift)
  tickets: Ticket[];
}
