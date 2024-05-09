import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { UserRole } from 'src/common/enum';
import { Column, DeleteDateColumn, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AccessGroup } from '../../group/entity/group.entity';
import { Shift } from '../../shift/entity/shift.entity';
import { Ticket } from '../../ticket/entity/ticket.entity';
import { Timecard } from '../../timecard/entity/timecard.entity';

@Entity({ name: 'tenant_users' })
export class TenantUser extends AbstractEntity {
  @Column()
  @Index()
  userId: string;

  @Column({ enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  deleteAble: boolean;

  @Column({ default: false })
  inviteBackOffice: boolean;

  @Column({ nullable: true })
  @Index()
  name: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email: string;

  @ManyToOne(() => AccessGroup, (group) => group.staffs, { nullable: true })
  group?: AccessGroup;

  @OneToMany(() => Shift, (shift) => shift.user)
  shifts: Shift[];

  @OneToMany(() => Timecard, (timecard) => timecard.employee)
  timecards: Timecard[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @DeleteDateColumn()
  deletedAt: Date;
}
