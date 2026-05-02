import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import { sendSms } from '@repo/integrations';

@Injectable()
export class VendorApplicationsService {
  findAll(status?: string) {
    return prisma.vendorApplication.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: any) {
    return prisma.vendorApplication.create({ data });
  }

  async approve(id: string) {
    const app = await prisma.vendorApplication.update({
      where: { id },
      data: { status: 'approved' },
    });

    // Create Expert profile from application
    const expert = await prisma.expert.create({
      data: {
        name: app.name,
        businessName: app.businessName,
        email: app.email,
        phone: app.phone,
        category: app.category,
        serviceArea: app.serviceArea,
        services: app.services,
        certifications: app.certDocUrls,
        status: 'approved',
      },
    });

    if (app.phone) {
      sendSms(
        app.phone,
        `Welcome to Local Butler Network! Your application has been approved. You'll receive job requests shortly.`,
      ).catch(() => {});
    }

    return expert;
  }

  async reject(id: string) {
    return prisma.vendorApplication.update({
      where: { id },
      data: { status: 'suspended' },
    });
  }
}
