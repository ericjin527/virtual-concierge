import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum TonePreset {
  WARM = 'warm',
  PREMIUM = 'premium',
  EFFICIENT = 'efficient',
  BILINGUAL = 'bilingual',
}

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsString()
  publicPhone: string;

  @IsString()
  ownerPhone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  timezone: string;

  @IsString()
  primaryLanguage: string;

  @IsString()
  @IsOptional()
  secondaryLanguage?: string;

  @IsEnum(TonePreset)
  @IsOptional()
  tonePreset?: TonePreset;

  @IsString()
  clerkOwnerId: string;
}
