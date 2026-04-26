import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(15)
  durationMinutes: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bestFor?: string;

  @IsString()
  @IsOptional()
  notBestFor?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
