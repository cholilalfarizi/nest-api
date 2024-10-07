import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transactions } from './transactions.entity';
import { Foods } from '../foods/foods.entity';

@Entity('transaction_detail')
export class TransactionDetail {
  @PrimaryGeneratedColumn()
  transactions_detail_id: number;

  @ManyToOne(
    () => Transactions,
    (transaction) => transaction.transaction_details,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'transaction_id' }) // Foreign key ke transaksi
  transaction: Transactions;

  @ManyToOne(() => Foods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_id' }) // Foreign key ke food
  food: Foods;

  @Column()
  qty: number;

  @Column({ type: 'decimal' })
  total_price: number;
}
