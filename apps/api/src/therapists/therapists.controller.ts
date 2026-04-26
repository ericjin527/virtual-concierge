import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TherapistsService } from './therapists.service';

@ApiTags('therapists')
@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}
}
