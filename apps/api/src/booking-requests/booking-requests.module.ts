import { Module } from '@nestjs/common';
import { BookingrequestsController } from './booking-requests.controller';
import { BookingrequestsService } from './booking-requests.service';

@Module({
  controllers: [BookingrequestsController],
  providers: [BookingrequestsService],
  exports: [BookingrequestsService],
})
export class BookingrequestsModule {}
