import { CountryCode } from 'countries-and-timezones';
import { DEFAULT_SCHEMA } from 'src/common/constant';
import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { UserRole } from 'src/common/enum';
import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { RefreshToken } from '../../refresh_token/entity/refresh.token.entity';

@Entity({ name: 'users', schema: DEFAULT_SCHEMA })
export class User extends AbstractEntity {
  @Column()
  name: string;

  @Column({ select: false })
  salt: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  pin: string;

  @Column({ select: false })
  hashedPassword: string;

  @Column({})
  country: CountryCode;

  @Column({ enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  companyId?: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @DeleteDateColumn()
  deletedAt: Date;
}
