import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'foods' })
export class Foods {
  @PrimaryGeneratedColumn()
  food_id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column({ default: false })
  is_deleted: boolean;
}
