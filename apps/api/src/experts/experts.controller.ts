import { Controller, Get, Post, Put, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  // ── Authenticated: current expert ───────────────────────────────────────────

  @UseGuards(ClerkAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.expertsService.findByClerkUserId(req.clerkUserId);
  }

  @UseGuards(ClerkAuthGuard)
  @Put('me')
  updateMe(@Req() req: any, @Body() body: any) {
    return this.expertsService.upsertByClerkUserId(req.clerkUserId, body);
  }

  // ── Public / Admin ───────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('glamCategory') glamCategory?: string,
    @Query('destinationId') destinationId?: string,
    @Query('status') status?: string,
  ) {
    return this.expertsService.findAll({ category, glamCategory, destinationId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.expertsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.expertsService.update(id, body);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.expertsService.approve(id);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.expertsService.suspend(id);
  }
}
