import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('category') category?: string) {
    return this.tasksService.findAll(status, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Post(':id/assign')
  assignExpert(@Param('id') id: string, @Body() body: { expertId: string }) {
    return this.tasksService.assignExpert(id, body.expertId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.tasksService.updateStatus(id, body.status);
  }

  @Post(':id/messages')
  addMessage(@Param('id') id: string, @Body() body: { fromRole: string; body: string }) {
    return this.tasksService.addMessage(id, body.fromRole, body.body);
  }
}
