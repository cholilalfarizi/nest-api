import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
