import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TwilioService } from './twilio.service';

@ApiTags('twilio')
@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}
}
