import { Module } from '@nestjs/common';
import { Transactions } from './transactions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { TransactionDetail } from './transactions-detail.entity';
import { Customers } from 'src/customer/customers.entity';
import { FoodsModule } from 'src/foods/foods.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transactions, TransactionDetail, Customers]),
    FoodsModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionsModule {}
