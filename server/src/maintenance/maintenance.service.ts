import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { UserRole, MaintenanceStatus, MaintenancePriority } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createMaintenanceDto: CreateMaintenanceDto) {
    return this.prisma.maintenanceRequest.create({
      data: {
        userId,
        title: createMaintenanceDto.title,
        description: createMaintenanceDto.description,
        priority: createMaintenanceDto.priority ?? MaintenancePriority.MEDIUM,
        status: MaintenanceStatus.OPEN,
      },
    });
  }

  async findAll(
    user: { id: string; role: UserRole; associationId?: string },
    status?: MaintenanceStatus,
    priority?: MaintenancePriority,
  ) {
    if (user.role === UserRole.RESIDENT) {
      return this.prisma.maintenanceRequest.findMany({
        where: {
          userId: user.id,
          ...(status && { status }),
          ...(priority && { priority }),
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Admin sees all, Manager sees requests from their association's users
    return this.prisma.maintenanceRequest.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: UserRole; associationId?: string }) {
    const request = await this.prisma.maintenanceRequest.findUnique({
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
      throw new NotFoundException('Maintenance request not found');
    }

    if (user.role === UserRole.RESIDENT && request.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this maintenance request');
    }

    if (user.role === UserRole.MANAGER && request.user.associationId !== user.associationId) {
      throw new ForbiddenException('You do not have access to this maintenance request');
    }

    return request;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto, user: { id: string; role: UserRole; associationId?: string }) {
    const request = await this.findOne(id, user);

    if (
      request.status === MaintenanceStatus.CLOSED &&
      updateMaintenanceDto.status !== MaintenanceStatus.CLOSED
    ) {
      throw new BadRequestException('Cannot update a closed maintenance request');
    }

    // Residents can only update their own OPEN requests (not change status or priority)
    if (user.role === UserRole.RESIDENT) {
      if (request.userId !== user.id) {
        throw new ForbiddenException('You can only update your own maintenance requests');
      }
      if (updateMaintenanceDto.status !== undefined || updateMaintenanceDto.priority !== undefined) {
        throw new ForbiddenException('Residents cannot change the status or priority of a maintenance request');
      }
      if (request.status !== MaintenanceStatus.OPEN) {
        throw new BadRequestException('You can only edit maintenance requests with status OPEN');
      }
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(updateMaintenanceDto.title && { title: updateMaintenanceDto.title }),
        ...(updateMaintenanceDto.description && { description: updateMaintenanceDto.description }),
        ...(updateMaintenanceDto.priority && { priority: updateMaintenanceDto.priority }),
        ...(updateMaintenanceDto.status && { status: updateMaintenanceDto.status }),
      },
    });
  }
}
