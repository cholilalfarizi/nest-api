import { IsNotEmpty, IsArray } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  customer_id: number;

  @IsArray()
  food_items: { food_id: number; qty: number }[];
}
