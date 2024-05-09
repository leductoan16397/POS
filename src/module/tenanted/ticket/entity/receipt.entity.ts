import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, Entity, Index, ManyToOne, OneToOne } from 'typeorm';
import { TransactionHistory } from '../../transaction/entity/transaction.history.entity';
import { PaymentStatus, PaymentType } from '../utils/enum';
import { Ticket } from './ticket.entity';

@Entity('receipts')
export class Receipt extends AbstractEntity {
  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalPrice: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  differentAmount: number;

  @Column({ nullable: false, enum: PaymentType, type: 'enum' })
  paymentType: PaymentType;

  @Column({ nullable: false, type: 'enum', enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  @Index()
  email?: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.receipts, { nullable: false })
  ticket: Ticket;

  @OneToOne(() => TransactionHistory, (transaction) => transaction.receipt, { nullable: true })
  transactionHistory: TransactionHistory;
}
