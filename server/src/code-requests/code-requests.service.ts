import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CodeRequestStatus, AccessCodeStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class CodeRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(associationId?: string, status?: CodeRequestStatus) {
    return this.prisma.codeRequest.findMany({
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
    const request = await this.prisma.codeRequest.findUnique({
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

    if (!request) {
      throw new NotFoundException('Code request not found');
    }

    return request;
  }

  async approve(id: string) {
    const request = await this.findOne(id);

    if (request.status !== CodeRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot approve a request with status ${request.status.toLowerCase()}`);
    }

    // Generate unique access code
    let accessCodeString = '';
    let isUnique = false;
    while (!isUnique) {
      accessCodeString = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.prisma.accessCode.findUnique({
        where: { code: accessCodeString },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    // Run transaction: update request status and create access code
    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.codeRequest.update({
        where: { id },
        data: { status: CodeRequestStatus.APPROVED },
      });

      const accessCode = await tx.accessCode.create({
        data: {
          associationId: request.associationId,
          code: accessCodeString,
          memberName: request.name,
          email: request.email,
          phone: request.phone,
          status: AccessCodeStatus.PENDING,
          expiresAt,
        },
      });

      return {
        message: 'Code request approved successfully. Access code generated.',
        accessCode: accessCode.code,
        request: updatedRequest,
      };
    });
  }

  async reject(id: string) {
    const request = await this.findOne(id);

    if (request.status !== CodeRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot reject a request with status ${request.status.toLowerCase()}`);
    }

    const updatedRequest = await this.prisma.codeRequest.update({
      where: { id },
      data: { status: CodeRequestStatus.REJECTED },
    });

    return {
      message: 'Code request rejected successfully.',
      request: updatedRequest,
    };
  }
}
