import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  create(businessId: string, dto: CreateRoomDto) {
    return prisma.room.create({ data: { businessId, ...dto } });
  }

  findAll(businessId: string) {
    return prisma.room.findMany({
      where: { businessId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  update(id: string, dto: UpdateRoomDto) {
    return prisma.room.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return prisma.room.update({ where: { id }, data: { active: false } });
  }
}
