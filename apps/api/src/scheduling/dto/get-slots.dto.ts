import { IsString, IsOptional, IsObject } from 'class-validator';

export class GetSlotsDto {
  @IsString()
  serviceId: string;

  @IsString()
  date: string; // "YYYY-MM-DD"

  @IsObject()
  @IsOptional()
  preferredWindow?: {
    start?: string;
    end?: string;
    label?: 'morning' | 'afternoon' | 'evening';
  };

  @IsString()
  @IsOptional()
  therapistPreference?: string;

  @IsString()
  @IsOptional()
  languagePreference?: string;

  @IsString()
  @IsOptional()
  genderPreference?: string;
}
