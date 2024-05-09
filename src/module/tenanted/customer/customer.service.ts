import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { DataSource, FindOptionsWhere, ILike } from 'typeorm';
import { CreateCustomerDto, SearchCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from './entity/customer.entity';
import { CustomerData } from './response/customer.res';

@Injectable()
export class CustomerService {
  private readonly customerRepository;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.customerRepository = connection.getRepository(Customer);
  }

  async getList({ search }: SearchCustomerDto): Promise<CustomerData[]> {
    const where: FindOptionsWhere<Customer> | FindOptionsWhere<Customer>[] =
      (search && [
        {
          name: ILike(`%${search.trim().toLowerCase()}%`),
        },
        {
          customerCode: ILike(`%${search.trim().toLowerCase()}%`),
        },
        {
          email: ILike(`%${search.trim().toLowerCase()}%`),
        },
        {
          phone: ILike(`%${search.trim().toLowerCase()}%`),
        },
      ]) ||
      {};

    const customers = await this.customerRepository.find({
      where,
      order: {
        lastVisit: 'DESC',
      },
    });

    return customers.map((item) => new CustomerData(item));
  }

  async store(body: CreateCustomerDto): Promise<CustomerData> {
    const customer = this.customerRepository.create(body);

    try {
      await this.customerRepository.save(customer);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: customer.service.ts ~ CustomerService::store ~ error:`, error);
      throw error;
    }

    return new CustomerData(customer);
  }

  async update(id: string, body: UpdateCustomerDto): Promise<CustomerData> {
    let customer = await this.customerRepository.findOne({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new BadRequestException('Customer Not Found');
    }

    try {
      await this.customerRepository.save({
        id,
        ...body,
      });

      customer = await this.customerRepository.findOne({
        where: { id },
      });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: customer.service.ts ~ CustomerService::update ~ error:`, error);
      throw error;
    }

    return new CustomerData(customer);
  }

  async findOne(id: string): Promise<CustomerData> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new BadRequestException('Customer Not Found');
    }

    return new CustomerData(customer);
  }
}
