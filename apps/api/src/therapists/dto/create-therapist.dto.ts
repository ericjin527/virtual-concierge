import { IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateTherapistDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
