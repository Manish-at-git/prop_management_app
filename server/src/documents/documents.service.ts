import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDocumentDto: CreateDocumentDto, user: { role: UserRole; associationId?: string }) {
    if (user.role === UserRole.MANAGER && createDocumentDto.associationId !== user.associationId) {
      throw new ForbiddenException('You can only upload documents for your own association');
    }

    // Check if association exists
    const association = await this.prisma.association.findUnique({
      where: { id: createDocumentDto.associationId },
    });
    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        fileUrl: createDocumentDto.fileUrl,
        associationId: createDocumentDto.associationId,
        uploadedById: userId,
      },
    });
  }

  async findAll(user: { role: UserRole; associationId?: string }) {
    if (user.role === UserRole.ADMIN) {
      return this.prisma.document.findMany({
        include: {
          association: {
            select: { name: true },
          },
          uploadedBy: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Manager or Resident - only see documents of their own association
    if (!user.associationId) {
      throw new ForbiddenException('You are not associated with any community association');
    }

    return this.prisma.document.findMany({
      where: {
        associationId: user.associationId,
      },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { role: UserRole; associationId?: string }) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (user.role !== UserRole.ADMIN && document.associationId !== user.associationId) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return document;
  }

  async remove(id: string, user: { role: UserRole; associationId?: string }) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (user.role === UserRole.MANAGER && document.associationId !== user.associationId) {
      throw new ForbiddenException('You can only delete documents belonging to your association');
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }
}
