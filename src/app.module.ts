import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Customers } from './customer/customers.entity';
import { FoodsModule } from './foods/foods.module';
import { Foods } from './foods/foods.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { Transactions } from './transactions/transactions.entity';
import { TransactionDetail } from './transactions/transactions-detail.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CustomerModule,
    FoodsModule,
    TransactionsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Customers, Foods, Transactions, TransactionDetail], // join(process.cwd(), dist/**/*.entity.js)
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    FoodsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
