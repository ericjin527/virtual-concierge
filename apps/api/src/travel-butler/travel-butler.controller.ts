import { Controller, Post, Body } from '@nestjs/common';
import { TravelButlerService } from './travel-butler.service';

@Controller('travel-butler')
export class TravelButlerController {
  constructor(private readonly service: TravelButlerService) {}

  @Post('chat')
  async chat(@Body() body: { messages: any[]; message: string; context?: string }) {
    const result = await this.service.chat(body.messages ?? [], body.message, body.context);
    if (result.intakeBrief) {
      const experience = await this.service.createExperience(result.intakeBrief);
      return { message: result.message, experienceId: experience.id, complete: true };
    }
    return { message: result.message, complete: false };
  }
}
