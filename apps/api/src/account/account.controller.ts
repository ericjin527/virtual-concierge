import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { prisma } from '@repo/db';

@Controller('account')
export class AccountController {
  @UseGuards(ClerkAuthGuard)
  @Get('my-experiences')
  async myExperiences(@Req() req: any) {
    const clerkUserId: string = req.clerkUserId;
    return prisma.experience.findMany({
      where: { lead: { clerkUserId } },
      include: { lead: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
