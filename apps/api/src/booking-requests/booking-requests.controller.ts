import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingRequestsService } from './booking-requests.service';

@ApiTags('booking-requests')
@Controller('booking-requests')
export class BookingRequestsController {
  constructor(private readonly bookingRequestsService: BookingRequestsService) {}
}
