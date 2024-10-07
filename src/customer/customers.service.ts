import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customers } from './customers.entity';
import { CreateCustomerDTO } from './dtos/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private readonly customersRepository: Repository<Customers>,
  ) {}

  async create(dto: CreateCustomerDTO) {
    const customer = this.customersRepository.create(dto);

    return await this.customersRepository.save(customer);
  }

  findAll() {
    return this.customersRepository.find({ where: { is_deleted: false } });
  }

  findById(id: number) {
    const customer = this.customersRepository.findOneBy({ customer_id: id });

    return customer;
  }

  async update(dto: CreateCustomerDTO, id: number) {
    const customer = await this.customersRepository.findOneBy({
      customer_id: id,
    });

    Object.assign(customer, dto);

    return await this.customersRepository.save(customer);
  }

  delete(id: number) {
    const customer = this.customersRepository.update(
      { customer_id: id },
      { is_deleted: true },
    );

    return customer;
  }
}
