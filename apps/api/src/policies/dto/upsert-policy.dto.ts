import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpsertPolicyDto {
  @IsString() @IsOptional() cancellationPolicy?: string;
  @IsString() @IsOptional() lateArrivalPolicy?: string;
  @IsString() @IsOptional() parking?: string;
  @IsString() @IsOptional() depositPolicy?: string;
  @IsString() @IsOptional() refundRule?: string;
  @IsString() @IsOptional() medicalDisclaimer?: string;
  @IsArray() @IsOptional() doNotSayRules?: string[];
}
