import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  // Admin: list proposals for a task
  @Get()
  listByTask(@Query('taskId') taskId: string) {
    return this.proposalsService.listByTask(taskId);
  }

  // Expert: list my proposals
  @UseGuards(ClerkAuthGuard)
  @Get('mine')
  listMine(@Req() req: any) {
    return this.proposalsService.listByExpert(req.clerkUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  // Admin: invite expert to task
  @Post()
  invite(@Body() body: { taskId: string; expertId: string; note?: string }) {
    return this.proposalsService.invite(body.taskId, body.expertId, body.note);
  }

  // Expert: accept with terms
  @UseGuards(ClerkAuthGuard)
  @Patch(':id/accept')
  accept(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.proposalsService.accept(id, req.clerkUserId, body);
  }

  // Expert: decline
  @UseGuards(ClerkAuthGuard)
  @Patch(':id/decline')
  decline(@Param('id') id: string, @Req() req: any, @Body() body: { note?: string }) {
    return this.proposalsService.decline(id, req.clerkUserId, body.note);
  }

  // Admin: select proposal
  @Post(':id/select')
  select(@Param('id') id: string) {
    return this.proposalsService.select(id);
  }

  // Admin: reject proposal
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: { note?: string }) {
    return this.proposalsService.reject(id, body.note);
  }
}
