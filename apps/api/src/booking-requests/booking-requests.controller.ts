import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingRequestsService } from './booking-requests.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';

@ApiTags('booking-requests')
@Controller('businesses/:businessId/booking-requests')
export class BookingRequestsController {
  constructor(private readonly bookingRequestsService: BookingRequestsService) {}

  @Post()
  create(@Param('businessId') businessId: string, @Body() dto: CreateBookingRequestDto) {
    return this.bookingRequestsService.create(businessId, dto);
  }

  @Get()
  findAll(@Param('businessId') businessId: string, @Query('status') status?: string) {
    return this.bookingRequestsService.findAll(businessId, status);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingRequestDto) {
    return this.bookingRequestsService.updateStatus(id, dto);
  }
}
