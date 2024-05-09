import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserData } from './response/user.res';
import { CreateUserDto, FindUserListDto, UpdateUserDto } from './dto/user.dto';
import { LoggedUser } from 'src/common/type';
import { Pagination } from 'src/common/common.response';
import { UserRole } from 'src/common/enum';
import { generateSalt, randomString } from 'src/common/utils';
import { AuthService } from '../auth/auth.service';
import { MailService } from 'src/module/common/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async create({ input, loggedUser }: { input: CreateUserDto; loggedUser: LoggedUser }) {
    const { email, name, pin, phone } = input;
    // check username
    const existUser = await this.userRepository.countBy({ email: email.trim().toLowerCase() });

    if (existUser) {
      throw new BadRequestException('User already exists');
    }

    // create user in pos shcema
    const currentUser = await this.userRepository.findOneBy({ id: loggedUser.id });

    const newUser = this.userRepository.create({
      email: email.trim().toLowerCase(),
      role: UserRole.POSUser,
      name,
      pin,
      phone,
      salt: generateSalt(),
      country: currentUser.country,
    });

    const password = randomString(9);

    newUser.hashedPassword = this.authService.encodePassword({
      password: password,
      salt: newUser.salt,
    });

    await this.userRepository.save(newUser);

    // send mail
    this.mailService.employeeCreated({ email, password: password }).catch((err) => {
      console.log(`${new Date().toString()} 🚀 ~ file: user.service.ts:61 ~ UserService ~ create ~ err:`, err);
    });

    return new UserData({
      createdAt: newUser.createdAt,
      email: newUser.email,
      id: newUser.id,
      name: newUser.name,
      pin: newUser.pin,
      role: newUser.role,
      updatedAt: newUser.updatedAt,
      phone: newUser.phone,
    });
  }

  async find({
    query: { page = 0, pageSize = 10, order = 'asc', sort = 'name', search }, // loggedUser,
  }: {
    query: FindUserListDto;
    loggedUser: LoggedUser;
  }): Promise<Pagination<UserData>> {
    // const currentUser = await this.userRepository.findOneBy({ id: loggedUser.id });
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = (search && [
      {
        name: ILike(`%${search.trim().toLowerCase()}%`),
        companyId: IsNull(),
      },
      {
        email: ILike(`%${search.trim().toLowerCase()}%`),
        companyId: IsNull(),
      },
    ]) || {
      companyId: IsNull(),
    };

    const [data, total] = await this.userRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    return {
      data: data.map((user) => {
        return new UserData(user);
      }),
      page,
      pageSize,
      total,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateUserDto }) {
    const tenantUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const { name, phone, pin } = updateInput;

    await this.userRepository.save({
      id,
      name,
      phone,
      pin,
    });

    return this.findOne({ id: tenantUser.id });
  }

  async findOne({ id }: { id: string }) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return new UserData(user);
  }

  async remove({ id }: { id: string }) {
    throw new BadRequestException('Not Implement');
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    const rs = await this.userRepository.delete({ id });
    return rs;
  }
}
