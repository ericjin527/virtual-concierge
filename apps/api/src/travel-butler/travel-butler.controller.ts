import { Controller, Post, Get, Param, Body, HttpCode } from '@nestjs/common';
import { TravelButlerService, IntakeDto } from './travel-butler.service';

@Controller('travel-butler')
export class TravelButlerController {
  constructor(private readonly service: TravelButlerService) {}

  // ── Legacy: mid-trip butler chat ────────────────────────────────────────────
  @Post('chat')
  async chat(@Body() body: { messages: any[]; message: string; context?: string; selectedServices?: string[] }) {
    const result = await this.service.chat(body.messages ?? [], body.message, body.context);
    if (result.intakeBrief) {
      const experience = await this.service.createExperience(result.intakeBrief, body.selectedServices ?? []);
      return { message: result.message, experienceId: experience.id, complete: true };
    }
    return { message: result.message, complete: false };
  }

  // ── New: form-based intake ───────────────────────────────────────────────────
  @Post('intake')
  async intake(@Body() body: IntakeDto) {
    return this.service.createIntake(body);
  }

  @Post('experiences/:id/confirm')
  @HttpCode(200)
  async confirm(@Param('id') id: string) {
    await this.service.confirmPlan(id);
    return { success: true };
  }
}
