import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto';
import { UpdateCorrectionStatusDto } from './dto/update-correction-status.dto';
import { CorrectionRequestStatus, UserRole } from '@prisma/client';

@Injectable()
export class CorrectionRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCorrectionRequestDto: CreateCorrectionRequestDto) {
    return this.prisma.correctionRequest.create({
      data: {
        userId,
        requestedName: createCorrectionRequestDto.requestedName,
        requestedAddress: createCorrectionRequestDto.requestedAddress,
        reason: createCorrectionRequestDto.reason,
        status: CorrectionRequestStatus.PENDING,
      },
    });
  }

  async findAll(user: { id: string; role: UserRole; associationId?: string }, status?: CorrectionRequestStatus) {
    if (user.role === UserRole.RESIDENT) {
      return this.prisma.correctionRequest.findMany({
        where: {
          userId: user.id,
          ...(status && { status }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Admin or Manager
    return this.prisma.correctionRequest.findMany({
      where: {
        ...(status && { status }),
        ...(user.role === UserRole.MANAGER && {
          user: {
            associationId: user.associationId,
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            associationId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user: { id: string; role: UserRole; associationId?: string }) {
    const request = await this.prisma.correctionRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            associationId: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Correction request not found');
    }

    if (user.role === UserRole.RESIDENT && request.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this correction request');
    }

    if (user.role === UserRole.MANAGER && request.user.associationId !== user.associationId) {
      throw new ForbiddenException('You do not have access to this correction request');
    }

    return request;
  }

  async updateStatus(
    id: string,
    updateCorrectionStatusDto: UpdateCorrectionStatusDto,
    user: { id: string; role: UserRole; associationId?: string },
  ) {
    const request = await this.findOne(id, user);

    if (request.status !== CorrectionRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot change status of a request that is already ${request.status.toLowerCase()}`);
    }

    return this.prisma.correctionRequest.update({
      where: { id },
      data: {
        status: updateCorrectionStatusDto.status,
      },
    });
  }
}
