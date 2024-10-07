import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { CreateFoodDTO } from './dtos/create-food.dto';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodService: FoodsService) {}

  @Get()
  findAll() {
    return this.foodService.findAll();
  }

  @Post()
  create(@Body() dto: CreateFoodDTO) {
    return this.foodService.create(dto);
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.foodService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: CreateFoodDTO) {
    return this.foodService.update(dto, id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.foodService.delete(id);
  }
}
