import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ShiftCashType } from '../utils/shift.cash.const';
import { Shift } from './shift.entity';

@Entity({ name: 'shift_cashes' })
export class ShiftCash extends AbstractEntity {
  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'enum', enum: ShiftCashType })
  type: ShiftCashType;

  @ManyToOne(() => Shift, (shift) => shift.cashes)
  shift: Shift;
}
