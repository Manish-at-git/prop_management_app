import { Controller, Get, Post, Body, Param, Delete, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Documents')
// @ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Public()
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload/Share a document (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    return this.documentsService.create(req.user.id, createDocumentDto, req.user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List association documents' })
  @ApiResponse({ status: 200, description: 'Return list of documents' })
  findAll(@Request() req) {
    return this.documentsService.findAll(req.user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get document details by ID' })
  @ApiResponse({ status: 200, description: 'Return document details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user);
  }

  @Public()
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete document (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Document successfully deleted' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.remove(id, req.user);
  }
}
