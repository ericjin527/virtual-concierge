import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBookingRequestDto {
  @IsEnum(['pending_owner_confirmation', 'confirmed', 'declined', 'needs_callback', 'cancelled'])
  status: 'pending_owner_confirmation' | 'confirmed' | 'declined' | 'needs_callback' | 'cancelled';

  @IsString()
  @IsOptional()
  notes?: string;
}
