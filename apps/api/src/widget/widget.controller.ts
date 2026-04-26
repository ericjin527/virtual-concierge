import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WidgetService } from './widget.service';

@ApiTags('widget')
@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}
}
