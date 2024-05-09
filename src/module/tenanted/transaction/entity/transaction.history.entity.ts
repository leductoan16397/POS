import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Receipt } from '../../ticket/entity/receipt.entity';
import { TransactionPaymentStatus } from '../utils/enum';

@Entity({ name: 'transaction_histories' })
export class TransactionHistory extends AbstractEntity {
  @Column({ nullable: false })
  transactionCode: string;

  @Column({ nullable: false })
  foreighTransactionId: string;

  @Column({ nullable: false })
  merchentCode: string;

  @Column({ nullable: true })
  last4Digits: string;

  @Column({ nullable: true })
  cardType: string;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  amount: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  vatAmount: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  tipAmount: number;

  @Column({ nullable: false, type: 'enum', enum: TransactionPaymentStatus })
  paymentStatus: TransactionPaymentStatus;

  @Column({ nullable: false })
  paymentType: string;

  @Column({ nullable: false })
  entryMode: string;

  @OneToOne(() => Receipt, (receipt) => receipt.transactionHistory, { cascade: true })
  @JoinColumn()
  receipt: Receipt;

  @DeleteDateColumn()
  deletedAt: Date;
}
