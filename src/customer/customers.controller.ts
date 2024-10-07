import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDTO } from './dtos/create-customer.dto';
import path from 'path';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCustomerDTO) {
    return this.customersService.create(dto);
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.customersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: CreateCustomerDTO) {
    return this.customersService.update(dto, id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.customersService.delete(id);
  }
}
