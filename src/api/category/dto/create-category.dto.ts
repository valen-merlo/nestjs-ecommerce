import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsNumber()
  @Min(1)
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
