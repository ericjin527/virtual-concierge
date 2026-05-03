import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';

export interface ExpertProfileDto {
  name?: string;
  bio?: string;
  photoUrl?: string;
  phone?: string;
  cities?: string[];
  categories?: string[];
  glamCategory?: string;
  destinationIds?: string[];
  areaIds?: string[];
  languages?: string[];
  metadata?: Record<string, any>;
  isAvailable?: boolean;
  maxConcurrentJobs?: number;
}

@Injectable()
export class ExpertsService {
  findAll(opts: { category?: string; glamCategory?: string; destinationId?: string; status?: string } = {}) {
    const { category, glamCategory, destinationId, status } = opts;
    return prisma.expert.findMany({
      where: {
        ...(status && status !== 'all' ? { status: status as any } : status === 'all' ? {} : { status: 'approved' }),
        ...(category ? { category: category as any } : {}),
        ...(glamCategory ? { glamCategory: glamCategory as any } : {}),
        ...(destinationId ? { destinationIds: { has: destinationId } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findOne(id: string) {
    const expert = await prisma.expert.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!expert) throw new NotFoundException('Expert not found');
    return expert;
  }

  async findByClerkUserId(clerkUserId: string) {
    return prisma.expert.findUnique({ where: { clerkUserId } });
  }

  async upsertByClerkUserId(clerkUserId: string, data: ExpertProfileDto) {
    const existing = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (existing) {
      return prisma.expert.update({
        where: { clerkUserId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
          ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
          ...(data.cities ? { cities: data.cities } : {}),
          ...(data.categories ? { categories: data.categories as any } : {}),
          ...(data.glamCategory !== undefined ? { glamCategory: data.glamCategory as any } : {}),
          ...(data.destinationIds ? { destinationIds: data.destinationIds } : {}),
          ...(data.areaIds ? { areaIds: data.areaIds } : {}),
          ...(data.languages ? { languages: data.languages } : {}),
          ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
          ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
          ...(data.maxConcurrentJobs !== undefined ? { maxConcurrentJobs: data.maxConcurrentJobs } : {}),
        },
      });
    }
    return prisma.expert.create({
      data: {
        clerkUserId,
        name: data.name ?? 'New Expert',
        phone: data.phone ?? '',
        email: `clerk_${clerkUserId}@pending.localbutler.app`,
        category: 'errand_helper' as any,
        categories: [] as any,
        glamCategory: data.glamCategory as any ?? null,
        destinationIds: data.destinationIds ?? [],
        areaIds: data.areaIds ?? [],
        cities: data.cities ?? [],
        bio: data.bio,
        photoUrl: data.photoUrl,
        languages: data.languages ?? ['en'],
        metadata: data.metadata ?? null,
        isAvailable: data.isAvailable ?? true,
        maxConcurrentJobs: data.maxConcurrentJobs ?? 2,
        serviceArea: data.cities?.[0] ?? '',
        status: 'pending',
      },
    });
  }

  create(data: any) {
    return prisma.expert.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return prisma.expert.update({ where: { id }, data });
  }

  async approve(id: string) {
    return prisma.expert.update({ where: { id }, data: { status: 'approved' } });
  }

  async suspend(id: string) {
    return prisma.expert.update({ where: { id }, data: { status: 'suspended' } });
  }
}
