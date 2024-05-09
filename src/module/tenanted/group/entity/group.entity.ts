import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { TenantUser } from '../../user/entity/tenant.user.entity';

@Entity({ name: 'tenant_user_groups' })
export class AccessGroup extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column({ default: true })
  deleteAble: boolean;

  @Column({ default: true })
  updateAble: boolean;

  @Column({ default: true })
  assignAble: boolean;

  @Column({ default: true, name: 'pos_access_able' })
  isManagePos: boolean;

  @Column({ default: true, name: 'back_office_access_able' })
  isManageBackOffice: boolean;

  @Column('varchar', { array: true, default: [], name: 'pos_permissions' })
  managePos: string[];

  @Column('varchar', { array: true, default: [], name: 'back_office_permissions' })
  manageBackOffice: string[];

  @OneToMany(() => TenantUser, (staff) => staff.group)
  staffs: TenantUser[];
}
