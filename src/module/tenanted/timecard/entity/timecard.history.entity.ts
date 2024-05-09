import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Timecard } from './timecard.entity';

export enum TimecardHistoryEvent {
  create = 'created',
  update = 'updated',
}

@Entity({ name: 'timecard_histories' })
export class TimecardHistory extends AbstractEntity {
  @Column({ nullable: true })
  clockIn?: Date;

  @Column()
  event: TimecardHistoryEvent;

  @Column({ nullable: true })
  clockOut?: Date;

  @ManyToOne(() => Timecard, (t) => t.histories, { cascade: true, onDelete: 'CASCADE' })
  timecard: Timecard;
}
