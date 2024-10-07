import { Module } from '@nestjs/common';
import { Foods } from './foods.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodsController } from './food.controller';
import { FoodsService } from './foods.service';

@Module({
  imports: [TypeOrmModule.forFeature([Foods])],
  controllers: [FoodsController],
  providers: [FoodsService],
  exports: [TypeOrmModule],
})
export class FoodsModule {}
