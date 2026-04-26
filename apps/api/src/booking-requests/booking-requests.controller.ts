import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingrequestsService } from './booking-requests.service';

@ApiTags('booking-requests')
@Controller('booking-requests')
export class BookingrequestsController {
  constructor(private readonly bookingrequestsService: BookingrequestsService) {}
}
