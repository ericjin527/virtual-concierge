import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
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

  @UseGuards(ClerkAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  deleteOwned(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteOwned(id, req.clerkUserId);
  }
}
