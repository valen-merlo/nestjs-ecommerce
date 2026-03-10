import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { variationTypesKeys } from 'src/database/entities/product.entity';
import { ProductDetails, ProductDetailsTypeFn } from './productDetails';

export class CreateProductDto {
  @IsNumber()
  @IsNotEmpty()
  public categoryId: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public code?: string;

  @IsOptional()
  @IsString()
  @IsIn(variationTypesKeys)
  public variationType?: string;

  @IsOptional()
  @IsDefined()
  @Type(ProductDetailsTypeFn)
  @ValidateNested()
  public details?: ProductDetails;

  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  public about?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public description?: string;
}

export class ProductDetailsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public code?: string;

  @IsOptional()
  @IsString()
  @IsIn(variationTypesKeys)
  public variationType?: string;

  @IsOptional()
  @IsDefined()
  @Type(ProductDetailsTypeFn)
  @ValidateNested()
  public details?: ProductDetails;

  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  public about?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public description?: string;
}
