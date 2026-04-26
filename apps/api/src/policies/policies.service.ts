import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';

@Injectable()
export class PoliciesService {
  findOne(businessId: string) {
    return prisma.policy.findUnique({ where: { businessId } });
  }

  upsert(businessId: string, dto: UpsertPolicyDto) {
    return prisma.policy.upsert({
      where: { businessId },
      create: { businessId, ...dto },
      update: dto,
    });
  }
}
