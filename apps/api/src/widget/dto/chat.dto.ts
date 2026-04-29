import { IsString, IsOptional } from 'class-validator';

export class WidgetChatDto {
  @IsString()
  businessId: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;
}
