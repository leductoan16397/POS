import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TenantUser } from '../../user/entity/tenant.user.entity';
import { Store } from '../../store/entity/store.entity';
import { TimecardHistory } from './timecard.history.entity';

export enum TimecardStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity({ name: 'timecards' })
export class Timecard extends AbstractEntity {
  @Column({ nullable: true })
  clockIn?: Date;

  @Column({ nullable: true })
  clockOut?: Date;

  @ManyToOne(() => TenantUser, (user) => user.timecards)
  employee: TenantUser;

  @ManyToOne(() => Store, (store) => store.timecards)
  store: Store;

  @Column('decimal')
  time: number;

  @Column({ enum: TimecardStatus, default: TimecardStatus.CLOSED })
  status: TimecardStatus;

  @OneToMany(() => TimecardHistory, (h) => h.timecard)
  histories: TimecardHistory[];
}
