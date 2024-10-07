import { IsArray } from 'class-validator';

export class UpdateTransactionDto {
  @IsArray()
  food_items: { food_id: number; qty: number }[];
}
