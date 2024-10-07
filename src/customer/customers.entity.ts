import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transactions } from '../transactions/transactions.entity';

@Entity({ name: 'customers' })
export class Customers {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ default: false })
  is_deleted: boolean;

  @OneToMany(() => Transactions, (transaction) => transaction.customer)
  transactions: Transactions[];
}
