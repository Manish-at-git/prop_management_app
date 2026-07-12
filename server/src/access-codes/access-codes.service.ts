import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { AccessCodeStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AccessCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccessCodeDto: CreateAccessCodeDto) {
    const { associationId, code: customCode, memberName, email, phone, expiresInDays } = createAccessCodeDto;

    // Check if association exists
    const association = await this.prisma.association.findUnique({
      where: { id: associationId },
    });
    if (!association) {
      throw new NotFoundException('Association not found');
    }

    let finalCode = customCode;
    if (finalCode) {
      // Check if custom code is unique
      const existing = await this.prisma.accessCode.findUnique({
        where: { code: finalCode },
      });
      if (existing) {
        throw new ConflictException('Access code already exists');
      }
    } else {
      // Generate a unique code
      let isUnique = false;
      while (!isUnique) {
        finalCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
        const existing = await this.prisma.accessCode.findUnique({
          where: { code: finalCode },
        });
        if (!existing) {
          isUnique = true;
        }
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    return this.prisma.accessCode.create({
      data: {
        associationId,
        code: finalCode,
        memberName,
        email,
        phone,
        expiresAt,
        status: AccessCodeStatus.PENDING,
      },
    });
  }

  async findAll(associationId?: string, status?: AccessCodeStatus) {
    return this.prisma.accessCode.findMany({
      where: {
        ...(associationId && { associationId }),
        ...(status && { status }),
      },
      include: {
        association: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const accessCode = await this.prisma.accessCode.findUnique({
      where: { id },
      include: {
        association: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!accessCode) {
      throw new NotFoundException('Access code not found');
    }

    return accessCode;
  }

  async revoke(id: string) {
    const accessCode = await this.findOne(id);

    if (accessCode.status === AccessCodeStatus.USED) {
      throw new ConflictException('Cannot revoke an access code that has already been used');
    }

    return this.prisma.accessCode.update({
      where: { id },
      data: {
        status: AccessCodeStatus.EXPIRED,
      },
    });
  }
}
