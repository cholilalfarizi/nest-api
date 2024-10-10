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

    // Mulai transaksi untuk memastikan atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Hitung total harga dan lakukan pengecekan stok
      for (const detail of food_items) {
        const food = await this.foodRepository.findOne({
          where: { food_id: detail.food_id },
        });
        if (!food) throw new NotFoundException('Food not found');

        // Cek apakah stok cukup
        if (food.stock < detail.qty) {
          throw new Error(`Not enough stock for ${food.name}`);
        }

        total_price += food.price * detail.qty;
        total_item += detail.qty;
      }

      // Buat transaksi utama
      const transaction = this.transactionRepository.create({
        customer: { customer_id },
        total_price,
        total_item,
        transaction_date: new Date(),
        is_deleted: false,
      });

      await this.transactionRepository.save(transaction);

      // Simpan detail transaksi dan kurangi stok
      for (const detail of food_items) {
        const food = await this.foodRepository.findOne({
          where: { food_id: detail.food_id },
        });

        // Kurangi stok makanan
        food.stock -= detail.qty;
        await this.foodRepository.save(food); // Simpan perubahan stok

        // Buat detail transaksi
        const transactionDetail = this.transactionDetailRepository.create({
          transaction,
          food,
          qty: detail.qty,
          total_price: food.price * detail.qty,
        });
        await this.transactionDetailRepository.save(transactionDetail);
      }

      // Commit transaksi jika semuanya berhasil
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      // Rollback transaksi jika ada error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      // Selesaikan query runner
      await queryRunner.release();
    }
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

  async findAll() {
    const transactions = await this.transactionRepository.find({
      where: { is_deleted: false },
      relations: ['customer'], // Ambil relasi customer
    });

    return transactions.map((transaction) => ({
      transaction_id: transaction.transaction_id,
      total_price: transaction.total_price,
      total_item: transaction.total_item,
      transaction_date: transaction.transaction_date,
      customer_id: transaction.customer.customer_id,
    }));
  }

  async findById(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: id, is_deleted: false },
      relations: [
        'customer',
        'transaction_details',
        'transaction_details.food',
      ], // Ambil relasi terkait
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return {
      total_price: transaction.total_price,
      transaction_date: transaction.transaction_date,
      customer: {
        name: transaction.customer.name,
      },
      transaction_details: transaction.transaction_details.map((detail) => ({
        qty: detail.qty,
        total_price: detail.total_price,
        food: {
          food_id: detail.food.food_id,
          name: detail.food.name,
          price: detail.food.price,
        },
      })),
    };
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
