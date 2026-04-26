import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingRequestDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsString()
  requestedDate: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  preferredSlot?: string;

  @IsOptional()
  recommendedSlotsJson?: unknown;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(['phone', 'web', 'sms', 'admin'])
  @IsOptional()
  source?: 'phone' | 'web' | 'sms' | 'admin';
}
