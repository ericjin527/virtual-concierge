import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  compatibleCategories?: string[];
}
