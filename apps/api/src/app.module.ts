import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { BusinessesModule } from './businesses/businesses.module';
import { ServicesModule } from './services/services.module';
import { TherapistsModule } from './therapists/therapists.module';
import { RoomsModule } from './rooms/rooms.module';
import { PoliciesModule } from './policies/policies.module';
import { SkillsModule } from './skills/skills.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { BookingRequestsModule } from './booking-requests/booking-requests.module';
import { TwilioModule } from './twilio/twilio.module';
import { WidgetModule } from './widget/widget.module';
import { UsageModule } from './usage/usage.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    BusinessesModule,
    ServicesModule,
    TherapistsModule,
    RoomsModule,
    PoliciesModule,
    SkillsModule,
    SchedulingModule,
    BookingRequestsModule,
    TwilioModule,
    WidgetModule,
    UsageModule,
  ],
})
export class AppModule {}
