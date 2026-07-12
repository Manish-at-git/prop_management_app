import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { AssociationQueryDto } from './dto/association-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssociationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssociationDto: CreateAssociationDto) {
    const codeExists = await this.prisma.association.findUnique({
      where: { code: createAssociationDto.code.toUpperCase() },
    });

    if (codeExists) {
      throw new BadRequestException('An association with this code already exists');
    }

    return this.prisma.association.create({
      data: {
        ...createAssociationDto,
        code: createAssociationDto.code.toUpperCase(),
      },
    });
  }

  async findAll(query: AssociationQueryDto) {
    const { page, limit, search, sortBy, sortOrder, status } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.AssociationWhereInput = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [associations, totalItems] = await Promise.all([
      this.prisma.association.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.association.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: associations,
      meta: {
        totalItems,
        itemCount: associations.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return association;
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    const association = await this.prisma.association.findUnique({
      where: { id },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return this.prisma.association.update({
      where: { id },
      data: updateAssociationDto,
    });
  }

  async remove(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    await this.prisma.association.delete({
      where: { id },
    });

    return { message: 'Association deleted successfully' };
  }
}
