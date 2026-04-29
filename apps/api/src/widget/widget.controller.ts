import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WidgetService } from './widget.service';
import { WidgetChatDto } from './dto/chat.dto';

@ApiTags('widget')
@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get(':businessId/config')
  getConfig(@Param('businessId') businessId: string) {
    return this.widgetService.getConfig(businessId);
  }

  @Post('chat')
  chat(@Body() dto: WidgetChatDto) {
    return this.widgetService.chat(dto.businessId, dto.sessionId, dto.message, dto.customerPhone);
  }
}
