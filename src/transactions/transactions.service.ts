import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transactions } from './transactions.entity';
import { TransactionDetail } from './transactions-detail.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { Foods } from '../foods/foods.entity';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transactions)
    private transactionRepository: Repository<Transactions>,
    @InjectRepository(TransactionDetail)
    private transactionDetailRepository: Repository<TransactionDetail>,
    @InjectRepository(Foods)
    private foodRepository: Repository<Foods>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { customer_id, food_items } = createTransactionDto;
    let total_price = 0;
    let total_item = 0;

    // Hitung total harga
    for (const detail of food_items) {
      const food = await this.foodRepository.findOne({
        where: { food_id: detail.food_id },
      });
      if (!food) throw new Error('Food not found');
      total_price += food.price * detail.qty;
      total_item += detail.qty;
    }

    const transaction = this.transactionRepository.create({
      customer: { customer_id },
      total_price,
      total_item,
      transaction_date: new Date(),
      is_deleted: false,
    });

    await this.transactionRepository.save(transaction);

    // Simpan detail transaksi
    for (const detail of food_items) {
      const food = await this.foodRepository.findOne({
        where: { food_id: detail.food_id },
      });
      const transactionDetail = this.transactionDetailRepository.create({
        transaction,
        food,
        qty: detail.qty,
        total_price: food.price * detail.qty,
      });
      await this.transactionDetailRepository.save(transactionDetail);
    }

    return transaction;
  }

  async updateTransaction(
    transaction_id: number,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { food_items } = updateTransactionDto;

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // 1. Cari transaksi berdasarkan ID
      const transaction = await this.transactionRepository.findOne({
        where: { transaction_id, is_deleted: false },
      });

      if (!transaction) {
        throw new NotFoundException(
          `Transaction with ID ${transaction_id} not found`,
        );
      }

      let total_item = 0;
      let total_price = 0;

      // 2. Hapus semua detail transaksi sebelumnya
      await this.transactionDetailRepository.delete({ transaction });

      // 3. Proses tiap detail transaksi yang diinputkan
      for (const detail of food_items) {
        const food = await this.foodRepository.findOne({
          where: { food_id: detail.food_id, is_deleted: false },
        });

        if (!food) {
          throw new NotFoundException(
            `Food with ID ${detail.food_id} not found`,
          );
        }

        // 4. Hitung total item dan total harga
        total_item += detail.qty;
        total_price += food.price * detail.qty;

        // 5. Buat detail transaksi baru
        const transactionDetail = this.transactionDetailRepository.create({
          transaction,
          food,
          qty: detail.qty,
          total_price: food.price * detail.qty,
        });

        // Simpan detail transaksi baru
        await this.transactionDetailRepository.save(transactionDetail);
      }

      // 6. Perbarui total transaksi utama
      transaction.total_item = total_item;
      transaction.total_price = total_price;
      await this.transactionRepository.save(transaction);

      // Commit transaksi
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      // Rollback jika ada error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update transaction');
    } finally {
      // Selesaikan query runner
      await queryRunner.release();
    }
  }

  findAll() {
    return this.transactionRepository.find({ where: { is_deleted: false } });
  }

  findById(id: number) {
    const transaction = this.transactionRepository.findOneBy({
      transaction_id: id,
    });

    return transaction;
  }

  delete(id: number) {
    const transaction = this.transactionRepository.update(
      {
        transaction_id: id,
      },
      { is_deleted: true },
    );

    return transaction;
  }
}
