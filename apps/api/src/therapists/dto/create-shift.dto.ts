import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateShiftDto {
  @IsInt() @Min(0) @Max(6) @IsOptional()
  dayOfWeek?: number;

  @IsString() @IsOptional()
  date?: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}
