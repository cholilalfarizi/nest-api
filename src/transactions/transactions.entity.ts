import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customers } from '../customer/customers.entity';
import { TransactionDetail } from './transactions-detail.entity';

@Entity('transactions')
export class Transactions {
  @PrimaryGeneratedColumn()
  transaction_id: number;

  @ManyToOne(() => Customers, (customer) => customer.transactions)
  @JoinColumn({ name: 'customer_id' })
  customer: Customers;

  @Column()
  total_price: number;

  @Column()
  total_item: number;

  @Column({ type: 'date' })
  transaction_date: Date;

  @Column({ default: false })
  is_deleted: boolean;

  @OneToMany(() => TransactionDetail, (detail) => detail.transaction, {
    cascade: true,
  })
  transaction_details: TransactionDetail[];
}
