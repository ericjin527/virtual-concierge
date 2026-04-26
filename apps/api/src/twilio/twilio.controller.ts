import { Controller, Post, Body, Header, HttpCode } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TwilioService } from './twilio.service';

@ApiTags('twilio')
@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  // Twilio posts application/x-www-form-urlencoded to this endpoint when a call comes in
  @Post('voice')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  @ApiExcludeEndpoint()
  async incomingCall(@Body() body: Record<string, string>): Promise<string> {
    return this.twilioService.handleIncomingCall(
      body['CallSid'] ?? '',
      body['From'] ?? '',
      body['To'] ?? '',
    );
  }

  // Twilio posts here after <Gather> captures speech
  @Post('voice/process-turn')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  @ApiExcludeEndpoint()
  async processTurn(@Body() body: Record<string, string>): Promise<string> {
    return this.twilioService.processVoiceTurn(
      body['CallSid'] ?? '',
      body['SpeechResult'],
    );
  }
}
