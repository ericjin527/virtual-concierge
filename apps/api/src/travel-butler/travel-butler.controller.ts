import { Controller, Post, Param, Body, HttpCode } from '@nestjs/common';
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

  @Post('experiences/:id/revise')
  async revise(
    @Param('id') _id: string,
    @Body() body: { messages: any[]; message: string; currentPlan: any },
  ) {
    return this.service.revisePlan(body.messages ?? [], body.message, body.currentPlan);
  }

  @Post('experiences/:id/confirm')
  @HttpCode(200)
  async confirm(@Param('id') id: string, @Body() body: { plan?: any }) {
    await this.service.confirmPlan(id, body?.plan);
    return { success: true };
  }
}
