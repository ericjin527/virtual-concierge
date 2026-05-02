import { Controller, Post, Body } from '@nestjs/common';
import { ButlerService } from './butler.service';

@Controller('butler')
export class ButlerController {
  constructor(private readonly butlerService: ButlerService) {}

  @Post('chat')
  async chat(@Body() body: { messages: any[]; message: string; category: string }) {
    const result = await this.butlerService.chat(body.messages ?? [], body.message, body.category ?? 'appliance_repair');

    if (result.intakeBrief) {
      const task = await this.butlerService.createTaskFromBrief(result.intakeBrief, body.category ?? 'appliance_repair');
      return { message: result.message, taskId: task.id, complete: true };
    }

    return { message: result.message, complete: false };
  }
}
