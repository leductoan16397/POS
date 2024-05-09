import { CountryCode } from 'countries-and-timezones';
import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Ticket } from '../../ticket/entity/ticket.entity';

@Entity('customers')
export class Customer extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  email: string;

  @Column()
  @Index()
  phone: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  province?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: CountryCode;

  @Column({ nullable: true })
  @Index()
  customerCode?: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ nullable: true, default: 0 })
  points?: number;

  @Column({ nullable: true, default: 0 })
  visitCount?: number;

  @Column({ nullable: true })
  lastVisit?: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.customer, { nullable: true })
  tickets: Ticket[];
}
