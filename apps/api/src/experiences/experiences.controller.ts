import { Controller, Get, Patch, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly service: ExperiencesService) {}

  @UseGuards(ClerkAuthGuard)
  @Get('mine')
  listMine(@Req() req: any) {
    return this.service.listByClerkUser(req.clerkUserId);
  }

  @Get()
  list(@Query('status') status?: string, @Query('type') type?: string, @Query('phone') phone?: string) {
    return this.service.list(status, type, phone);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }
}
