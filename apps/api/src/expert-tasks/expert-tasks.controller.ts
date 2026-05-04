import { Controller, Get, Post, Param, Body, Query, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ExpertTasksService } from './expert-tasks.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

@Controller('expert-tasks')
export class ExpertTasksController {
  constructor(private readonly service: ExpertTasksService) {}

  // Public — job board (no auth, no PII)
  @Get()
  listOpen(
    @Query('glamCategory') glamCategory?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.service.listOpen(glamCategory ?? category, city);
  }

  // Auth-gated — my tasks
  @UseGuards(ClerkAuthGuard)
  @Get('mine')
  getMine(@Req() req: any, @Query('status') status?: string) {
    return this.service.getMine(req.clerkUserId, status);
  }

  // Auth-gated — task detail (only expert who owns it)
  @UseGuards(ClerkAuthGuard)
  @Get(':id/detail')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.service.getOneForExpert(id, req.clerkUserId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post(':id/accept')
  @HttpCode(200)
  accept(@Param('id') id: string, @Req() req: any) {
    return this.service.accept(id, req.clerkUserId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post(':id/start')
  @HttpCode(200)
  start(@Param('id') id: string, @Req() req: any) {
    return this.service.start(id, req.clerkUserId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post(':id/complete')
  @HttpCode(200)
  complete(@Param('id') id: string, @Req() req: any, @Body() body: { deliverable?: any }) {
    return this.service.complete(id, req.clerkUserId, body.deliverable);
  }
}
