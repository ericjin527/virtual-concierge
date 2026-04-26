import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsageService } from './usage.service';

@ApiTags('usage')
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}
}
