import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Foods } from './foods.entity';
import { Repository } from 'typeorm';
import { CreateFoodDTO } from './dtos/create-food.dto';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Foods)
    private readonly foodsRepository: Repository<Foods>,
  ) {}

  async create(dto: CreateFoodDTO) {
    const food = this.foodsRepository.create({ ...dto, is_deleted: false });

    return await this.foodsRepository.save(food);
  }

  findAll() {
    return this.foodsRepository.find({ where: { is_deleted: false } });
  }

  findById(id: number) {
    const food = this.foodsRepository.findOneBy({ food_id: id });

    return food;
  }

  async update(dto: CreateFoodDTO, id: number) {
    const food = await this.foodsRepository.findOneBy({
      food_id: id,
    });

    Object.assign(food, dto);

    return await this.foodsRepository.save(food);
  }

  delete(id: number) {
    const food = this.foodsRepository.update(
      { food_id: id },
      { is_deleted: true },
    );

    return food;
  }
}
