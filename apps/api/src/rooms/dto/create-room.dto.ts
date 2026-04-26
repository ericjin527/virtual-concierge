import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  compatibleCategories?: string[];
}
