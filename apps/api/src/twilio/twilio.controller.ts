import { Controller, Post, Body, Header, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TwilioService } from './twilio.service';

const FALLBACK_TWIML = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, something went wrong. Please try again later.</Say><Hangup/></Response>`;

@ApiTags('twilio')
@Controller('twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);
  constructor(private readonly twilioService: TwilioService) {}

  @Post('voice')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  @ApiExcludeEndpoint()
  async incomingCall(@Body() body: Record<string, string>): Promise<string> {
    this.logger.log(`Incoming call: CallSid=${body['CallSid']} From=${body['From']} To=${body['To']}`);
    try {
      return await this.twilioService.handleIncomingCall(
        body['CallSid'] ?? '',
        body['From'] ?? '',
        body['To'] ?? '',
      );
    } catch (err) {
      this.logger.error('handleIncomingCall error:', err);
      return FALLBACK_TWIML;
    }
  }

  @Post('voice/process-turn')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  @ApiExcludeEndpoint()
  async processTurn(@Body() body: Record<string, string>): Promise<string> {
    this.logger.log(`Voice turn: CallSid=${body['CallSid']} Speech="${body['SpeechResult']}"`);
    try {
      return await this.twilioService.processVoiceTurn(
        body['CallSid'] ?? '',
        body['SpeechResult'],
      );
    } catch (err) {
      this.logger.error('processVoiceTurn error:', err);
      return FALLBACK_TWIML;
    }
  }
}
