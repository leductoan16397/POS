import { DEFAULT_SCHEMA } from 'src/common/constant';
import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { CompanyConfig } from '../../company_config/entity/company.config.entity';
import { User } from '../../user/entity/user.entity';
import { CompanyStatus } from 'src/common/enum';

@Entity({ name: 'companies', schema: DEFAULT_SCHEMA })
export class Company extends AbstractEntity {
  @Column()
  @Index()
  businessName: string;

  @Column({ unique: true, update: false })
  @Index()
  key: string;

  @Column({})
  @Index()
  ownerEmail: string;

  @Column({ type: 'enum', enum: CompanyStatus })
  status: CompanyStatus;

  @OneToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @OneToOne(() => CompanyConfig)
  @JoinColumn()
  config: CompanyConfig;
}
